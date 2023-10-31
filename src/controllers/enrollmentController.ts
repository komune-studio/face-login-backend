import {NextFunction, Request, Response} from "express";
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError, HandledInternalServerError,
    InternalServerError
} from "../errors/RequestErrorCollection";
import EnrollmentDAO from "../daos/EnrollmentDAO";
import hidash from "../utils/hidash";
import request, {requestWithFile} from "../utils/api.utils";
import {toInteger} from "lodash";
import enrollmentDAO from "../daos/EnrollmentDAO";
import moment from "moment";


// let url = `http://${process.env.FREMISN_HOST}:${process.env.FREMISN_PORT}`

let url = `http://localhost:4005`
let verihub_api_key = process.env.VERIHUB_API_KEY
let verihub_app_id = process.env.VERIHUB_APP_ID

async function sendMessage(url: string, body: {}, method: string) {
    try {
        console.log(body)
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return await response.json()
    } catch (error) {
        console.log(error)
        throw error
    }
}

async function sendMessageWithHeaders(url: string, headers: {}, body: {}, method: string) {
    try {
        console.log(body)
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(body)
        });
        return await response.json()
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function getById(req: Request, res: Response, next: NextFunction) {

    let id = req.params.id

    try {

        let enr = await EnrollmentDAO.getById(id)
        enr.image = Buffer.from(enr.image).toString('base64')
        enr.ktp_image = Buffer.from(enr.ktp_image).toString('base64')


        if (!enr) return next(new EntityNotFoundError("Enrollment", id))
        return res.send(hidash.desensitizedFactory(enr))

    } catch (e) {
        next(new InternalServerError(e))
    }
}


export async function edit(req: Request, res: Response, next: NextFunction) {

    try {
        let id = req.params.id
        //if (isNaN(id)) return next(new BadParamIdError)

        let body = req.body
        let base64Img = body.photo

        //Get enrollment by ID
        let enrollment = await EnrollmentDAO.getById(id)
        if (!enrollment) return next(new EntityNotFoundError("Enrollment", id))

        //Format enrollment
        body = EnrollmentDAO.formatEdit(body)
        delete body['identity_number']
        let result

        //Edit enrollment in table if photo doesn't exist
        if (!body.hasOwnProperty("photo")) {
            result = await EnrollmentDAO.edit(id, body)
            res.send(result)
        }
        body.photo = new Buffer(body.photo, 'base64')
        //Delete in Fremis
        let deleteFremisBody = {
            "keyspace": "Korlantas",
            "face_ids": [
                enrollment.identity_number
            ]
        }
        let deleteInFremis = await sendMessage(`${url}/v1/face/delete-enrollment`, deleteFremisBody, "POST")

        //Input to Fremis
        let createFremisBody = {
            image: base64Img,
            keyspace: "Korlantas",
            additional_params: {
                face_id: enrollment.identity_number
            }
        }
        let createInFremis = await sendMessage(`${url}/v1/face/enrollment`, createFremisBody, "POST")

        if (!createInFremis.face_id) {
            return next(new HandledInternalServerError(createInFremis.description, "INTERNAL_SERVER_ERROR"))
        }

        result = await EnrollmentDAO.edit(id, body)

        //Create response
        let response = {...result, fremis_delete_status: deleteInFremis, fremis_create_status: createInFremis}
        //res.send({...response, photo: Buffer.from(result.photo).toString('base64')})
        // return res.send({success: true})

    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }
}

function paginate(array: [], page_size: number, page_number: number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

export async function getWithPagination(req: Request, res: Response, next: NextFunction) {
    try {
        let {limit, page, search} = req.query

        if (!limit || !page) return next(new BadRequestError("No pagination param received", "NO_PAGINATION_PARAM"))

        // @ts-ignore
        let result = await EnrollmentDAO.getAll(toInteger(page) - 1, toInteger(limit), search);

        // @ts-ignore
        let countResult = await EnrollmentDAO.getCount(search);


        let obj = {        // @ts-ignore
            enrollments: result.map((data: {
                image: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>;
            }) => ({
                ...data,
                image: Buffer.from(data.image).toString('base64').replace('dataimage', 'data:image').replace('base64', ';base64,'),
                ktp_image: Buffer.from(data.ktp_image).toString('base64').replace('dataimage', 'data:image').replace('base64', ';base64,')
            })),
            limit: toInteger(limit),
            current_page: toInteger(page),
            total_data: countResult._count.id,
            total_page: Math.ceil(countResult._count.id / toInteger(limit))
        }

        res.send(obj)
    } catch (e) {
        return next(e);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {

        let body = req.body
        if (!body.image) return next(new BadRequestError("image is missing!", "IMAGE_MISSING"))
        if (!body.ktp_image) return next(new BadRequestError("ktp_image is missing!", "KTP_IMAGE_MISSING"))
        if (!body.subject_id) return next(new BadRequestError("subject_id is missing!", "SUBJECT_ID_MISSING"))
        if (!body.email) return next(new BadRequestError("email is missing!", "EMAIL_MISSING"))
        if (!body.name) return next(new BadRequestError("name is missing!", "NAME_MISSING"))
        if (!body.birth_date) return next(new BadRequestError("birth_date is missing!", "BIRTH_DATE_MISSING"))
        if (!body.phone_num) return next(new BadRequestError("phone_num is missing!", "BIRTH_DATE_MISSING"))

        let checkIfExist = await EnrollmentDAO.getById(body.subject_id)
        if (checkIfExist) {
            return res.send({
                success: false,
                message: 'Subject already enrolled!'
            })
        }

        let headers = {
            "API-Key": verihub_api_key,
            "App-ID": verihub_app_id,
            "accept": "application/json",
            "content-type": 'application/json'
        }

        if (process.env.DISABLE_VERIFICATION !== 'true') {
            let verificationResult = await sendMessageWithHeaders('https://api.verihubs.com/data-verification/certificate-electronic/verify', headers, {
                nik: body.subject_id,
                name: body.name,
                birth_date: moment(body.birth_date).format('DD-MM-YYYY'),
                email: body.email,
                phone: body.phone_num,
                selfie_photo: body.image,
                ktp_photo: body.ktp_image
            }, 'POST')

            if (verificationResult.error_code) {
                return res.send({success: false, result: verificationResult})
            } else if (verificationResult.data && verificationResult.data.status === 'not_verified') {
                return res.send({success: false, result: verificationResult})
            }
        }

        let result = await sendMessageWithHeaders('https://api.verihubs.com/v1/face/enroll', headers, body, 'POST')

        if (result.message === "Request Success") {
            const id = body.subject_id;
            delete body.subject_id;

            let enrollment = await enrollmentDAO.create({
                ...body,
                id,
                birth_date: new Date(body.birth_date),
                image: new Buffer(body.image, 'base64'),
                ktp_image: new Buffer(body.ktp_image, 'base64')
            })
            result.returned = true
            return res.send({success: true, result: result})
        }
        // return res.send({result: result})

    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }
}

export async function _delete(req: Request, res: Response, next: NextFunction) {
    try {
        let {id} = req.params
        if (!id) return next(new BadRequestError("id is missing!", "SUBJECT_ID_MISSING"))

        let checkIfExist = await EnrollmentDAO.getById(id)
        if (!checkIfExist) {
            return res.send({
                success: false,
                message: 'Enrollment not found!'
            })
        }

        let headers = {
            "API-Key": verihub_api_key,
            "App-ID": verihub_app_id,
            "accept": "application/json",
            "content-type": 'application/json'
        }
        let result = await sendMessageWithHeaders(`https://api.verihubs.com/v1/face/enroll?subject_id=${id}`, headers, {}, 'DELETE')
        if (result.timestamp) {
            let enrollment = await enrollmentDAO._delete(id)
            return res.send({result: result})
        }

        return res.send({faulty_delete: true, result: result, message: "Enrollment was not deleted in database!"})
    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        let body = req.body

        if (!body.image) return next(new BadRequestError("image is missing!", "IMAGE_MISSING"))
        if (!body.ktp_image) return next(new BadRequestError("ktp_image is missing!", "KTP_IMAGE_MISSING"))
        if (!body.subject_id) return next(new BadRequestError("subject_id is missing!", "SUBJECT_ID_MISSING"))
        if (!body.email) return next(new BadRequestError("email is missing!", "EMAIL_MISSING"))
        if (!body.name) return next(new BadRequestError("name is missing!", "NAME_MISSING"))
        if (!body.birth_date) return next(new BadRequestError("birth_date is missing!", "BIRTH_DATE_MISSING"))
        if (!body.phone_num) return next(new BadRequestError("phone_num is missing!", "BIRTH_DATE_MISSING"))

        let checkIfExist = await EnrollmentDAO.getById(body.subject_id)
        if (!checkIfExist) {
            return res.send({
                success: false,
                message: 'Enrollment not found!',
            })
        }

        let headers = {
            "API-Key": verihub_api_key,
            "App-ID": verihub_app_id,
            "accept": "application/json",
            "content-type": 'application/json'
        }

        if (process.env.DISABLE_VERIFICATION !== 'true') {
            let verificationResult = await sendMessageWithHeaders('https://api.verihubs.com/data-verification/certificate-electronic/verify', headers, {
                nik: body.subject_id,
                name: body.name,
                birth_date: moment(body.birth_date).format('DD-MM-YYYY'),
                email: body.email,
                phone: body.phone_num,
                selfie_photo: body.image,
                ktp_photo: body.ktp_image
            }, 'POST')

            if (verificationResult.error_code) {
                return res.send({success: false, result: verificationResult})
            } else if (verificationResult.data && verificationResult.data.status === 'not_verified') {
                return res.send({success: false, result: verificationResult})
            }
        }


        let result = await sendMessageWithHeaders('https://api.verihubs.com/v1/face/enroll', headers, body, 'POST')

        if (result.message === "Request Success") {
            let enrollment = await enrollmentDAO.edit(body.subject_id, {
                image: new Buffer(body.image, 'base64'),
                ktp_image: new Buffer(body.ktp_image, 'base64'),
                name: body.name,
                birth_date: new Date(body.birth_date),
                phone_num: body.phone_num,
                email: body.email
            })
            result.returned = true
            return res.send({success: true, result: result})
        }

        res.send({result: result})
    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }
}

export async function face_login(req: Request, res: Response, next: NextFunction) {
    try {
        let body = {...req.body}


        if (!body.image) return next(new BadRequestError("image is missing!", "IMAGE_MISSING"))
        if (!body.threshold) return next(new BadRequestError("threshold is missing!", "THRESHOLD_MISSING"))


        let headers = {
            "API-Key": verihub_api_key,
            "App-ID": verihub_app_id,
            "accept": "application/json",
            "content-type": 'application/json'
        }

        let result = await sendMessageWithHeaders('https://api.verihubs.com/v1/face/search', headers, body, 'POST')

        if (result.matches && result.matches.length > 0) {
            for (const match of result.matches) {
                // @ts-ignore
                const face = await enrollmentDAO.getById(match.subject_id);

                if (face) {
                    // @ts-ignore
                    match.ktp_image = Buffer.from(face.ktp_image).toString('base64').replace('dataimage', 'data:image').replace('base64', ';base64,');
                    // @ts-ignore
                    match.name = face.name;
                    // @ts-ignore
                    match.birth_date = face.birth_date;
                    // @ts-ignore
                    match.email = face.email;
                    // @ts-ignore
                    match.phone_num = face.phone_num;
                }
            }
        }

        res.send({success: result.matches && result.matches.length > 0 ? true : false, result: result})
    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }
}


// export async function delete_(req: Request, res: Response, next: NextFunction) {
//
//     try {
//         //Get by enrollment by ID
//         let id = parseInt(req.params.id)
//
//         if (isNaN(id)) return next(new BadParamIdError)
//         let user = await EnrollmentDAO.getById(id)
//
//         //Error response if not found by id
//         if (user.deleted_at !== null) return next(new EntityNotFoundError("Enrollment ID", id))
//
//         //Soft delete
//         let obj = await EnrollmentDAO.edit(id, { deleted_at: new Date()})
//         if (!obj) return res.send(new BadRequestError("Failed to change"))
//
//         //Delete in Fremis
//         let deleteFremisBody = {
//             "keyspace": "Korlantas",
//             "face_ids": [
//                 obj.identity_number
//             ]
//         }
//
//         //Delete in Fremis
//         let deleteInFremis = await sendMessage(`${url}/v1/face/delete-enrollment`, deleteFremisBody, "POST")
//
//         //Create Response
//         let response = {...obj, fremis_delete_status: deleteInFremis}
//         console.log(deleteInFremis)
//         return res.send(response)
//
//     } catch (e) {
//         next(new InternalServerError(e))
//     }
// }

// export async function faceMatch(req: Request, res: Response, next: NextFunction) {
//
//     try {
//         //Get by enrollment by ID
//         let user = await EnrollmentDAO.getByIdentityNumber(req.body.nik)
//
//         //Error response if not found by id
//         if (user.length === 0) return next(new EntityNotFoundError("NIK", req.body.nik))
//
//         let faceMatchResult = await sendMessage(`${url}/v1/face/match`, {
//             "image_a": {
//                 "content": req.body.image
//             },
//             "image_b": {
//                 "content": Buffer.from(user[0].photo).toString('base64')
//             }
//         }, "POST")
//
//         if(faceMatchResult.description) {
//             return next(new HandledInternalServerError(faceMatchResult.description, "INTERNAL_SERVER_ERROR"))
//         }
//
//         res.send(faceMatchResult)
//     } catch (e) {
//         next(new InternalServerError(e))
//     }
// }
