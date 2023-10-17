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


// let url = `http://${process.env.FREMISN_HOST}:${process.env.FREMISN_PORT}`

let url = `http://localhost:4005`
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

export async function getById(req: Request, res: Response, next: NextFunction) {

    let id = parseInt(req.params.id)
    if (isNaN(id)) return next(new BadParamIdError)

    try {

        let enr = await EnrollmentDAO.getById(id)
        enr.photo = Buffer.from(enr.photo).toString('base64')


        if (!enr) return next(new EntityNotFoundError("Enrollment", id))
        return res.send(hidash.desensitizedFactory(enr))

    } catch (e) {
        next(new InternalServerError(e))
    }
}


export async function edit(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) return next(new BadParamIdError)

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

        if(!createInFremis.face_id) {
            return next(new HandledInternalServerError(createInFremis.description, "INTERNAL_SERVER_ERROR"))
        }

        result = await EnrollmentDAO.edit(id, body)

        //Create response
        let response = {...result, fremis_delete_status: deleteInFremis, fremis_create_status: createInFremis}
        res.send({...response, photo: Buffer.from(result.photo).toString('base64')})
        // return res.send({success: true})

    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }
}


// export async function getAll(req: Request, res: Response, next: NextFunction) {
//     try {
//         let orgs = await EnrollmentDAO.getAll()
//         res.send(orgs)
//
//         return orgs
//     } catch (e) {
//         next(new InternalServerError(e))
//     }
// }

function paginate(array: [], page_size: number, page_number: number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

export async function getWithPagination(req: Request, res: Response, next: NextFunction) {
    try {
        let{limit, page, search} = req.query

        // @ts-ignore
        let result = await EnrollmentDAO.getAll(toInteger(page) - 1, toInteger(limit), search);

        // @ts-ignore
        let countResult = await EnrollmentDAO.getCount(search);

        let obj = {
            enrollments: result.map(data => ({...data, photo: Buffer.from(data.photo).toString('base64')})),
            limit: toInteger(limit),
            current_page: toInteger(page),
            total_data: countResult._count.id,
            total_page: Math.ceil(countResult._count.id/toInteger(limit))
        }

        res.send(obj)
    } catch (e) {
        return next(e);
    }
}




export async function create(req: Request, res: Response, next: NextFunction) {
    try{
        let body = req.body

        if(body.identity_number.length != 16){
            return res.send({error: "NIK has to have 16 characters!"})
        }

        //Validate if enrollment already exist by NIK
        const validate = await EnrollmentDAO.getByIdentityNumber(body.identity_number)
        if(validate.length > 0){
            return res.send({error: "NIK already exist!"})
        }

        //Input data to Fremis
        let fremisBody = {
            image: body.photo,
            keyspace: "Korlantas",
            additional_params: {
                face_id: body.identity_number
            }
        }
        let result = await sendMessage(`${url}/v1/face/enrollment`, fremisBody, "POST")

        if(!result.face_id) {
            return next(new HandledInternalServerError(result.description, "INTERNAL_SERVER_ERROR"))
        }

        //Change format
        body.name = body.name.toUpperCase()
        body.photo = new Buffer(body.photo, 'base64')

        if(body.hasOwnProperty("gender")){
            if(body.gender.toUpperCase() == "MALE"){
                body.gender = "MALE"
            }else if(body.gender.toUpperCase() == "FEMALE"){
                body.gender = "FEMALE"
            }
        }


        //Create new row in enrollment table
        let newEnrollment = await EnrollmentDAO.create(body)

        //Check for required keys
        let test = hidash.checkPropertyV2(newEnrollment, "Enrollment", EnrollmentDAO.getRequired())
        if (test.error_message) return next(test)

        //Create response
        let response = {...newEnrollment, fremis_create_status: result}

        return res.send({...response, photo: Buffer.from(response.photo).toString('base64')})
    }catch (e) {
        e = new InternalServerError(e)
        next(e)
    }
}

export async function delete_(req: Request, res: Response, next: NextFunction) {

    try {
        //Get by enrollment by ID
        let id = parseInt(req.params.id)

        if (isNaN(id)) return next(new BadParamIdError)
        let user = await EnrollmentDAO.getById(id)

        //Error response if not found by id
        if (user.deleted_at !== null) return next(new EntityNotFoundError("Enrollment ID", id))

        //Soft delete
        let obj = await EnrollmentDAO.edit(id, { deleted_at: new Date()})
        if (!obj) return res.send(new BadRequestError("Failed to change"))

        //Delete in Fremis
        let deleteFremisBody = {
            "keyspace": "Korlantas",
            "face_ids": [
                obj.identity_number
            ]
        }

        //Delete in Fremis
        let deleteInFremis = await sendMessage(`${url}/v1/face/delete-enrollment`, deleteFremisBody, "POST")

        //Create Response
        let response = {...obj, fremis_delete_status: deleteInFremis}
        console.log(deleteInFremis)
        return res.send(response)

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function faceMatch(req: Request, res: Response, next: NextFunction) {

    try {
        //Get by enrollment by ID
        let user = await EnrollmentDAO.getByIdentityNumber(req.body.nik)

        //Error response if not found by id
        if (user.length === 0) return next(new EntityNotFoundError("NIK", req.body.nik))

        let faceMatchResult = await sendMessage(`${url}/v1/face/match`, {
            "image_a": {
                "content": req.body.image
            },
            "image_b": {
                "content": Buffer.from(user[0].photo).toString('base64')
            }
        }, "POST")

        if(faceMatchResult.description) {
            return next(new HandledInternalServerError(faceMatchResult.description, "INTERNAL_SERVER_ERROR"))
        }

        res.send(faceMatchResult)
    } catch (e) {
        next(new InternalServerError(e))
    }
}