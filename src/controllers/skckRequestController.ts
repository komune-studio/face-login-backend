import {NextFunction, Request, Response} from "express";
import {
    BadParamIdError, BadRequestError,
    EntityNotFoundError,
    InternalServerError
} from "../errors/RequestErrorCollection";
import EnrollmentDAO from "../daos/EnrollmentDAO";
import hidash from "../utils/hidash";
import request from "../utils/api.utils";
import SkckRequestDAO from "../daos/SkckRequestDAO";

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await SkckRequestDAO.getById(req.decoded.user_id);

        res.send({data})
    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    let headers = {
        "API-Key": process.env.VERIHUB_API_KEY,
        "App-ID": process.env.VERIHUB_APP_ID
    }

    let id = req.decoded.user_id

    const user = await EnrollmentDAO.getById(id);

    try {
        if (!req.body.image) return next(new BadRequestError("image is missing!", "IMAGE_MISSING"))

        let result = await request(`https://api.verihubs.com/v1/face/compare`, 'POST', {
            image_1: Buffer.from(user.image).toString('base64'),
            image_2: req.body.image
        }, headers);

        if(result.similarity_status) {
            await SkckRequestDAO.create({user_id: id})
        }

        return res.send({success: result.similarity_status, result})
    } catch (e) {
        res.send({
            success: false,
            result: e
        })
    }
}

