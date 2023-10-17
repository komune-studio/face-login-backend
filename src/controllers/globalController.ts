import {NextFunction, Request, Response} from "express";
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError, HandledInternalServerError,
    InternalServerError,
    UnauthorizedError
} from "../errors/RequestErrorCollection";
import UserDAO from "../daos/UserDAO";
import hidash from "../utils/hidash";
import crypto from "../utils/crypto";
import jwt, { Secret } from "jsonwebtoken";
import validation from "../utils/validation";
import ApiHitLogDAO from "../daos/ApiHitLogDAO";
import EnrollmentDAO from "../daos/EnrollmentDAO";
import request from "../utils/api.utils";

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {

    try {

        let total_hit = await ApiHitLogDAO.getCount()
        let success_hits = await ApiHitLogDAO.getCount_GroupedBy_api_accessed()
        let hit_per_month = await ApiHitLogDAO.getThisYearCount_GroupedBy_api_accessed()
        let enrollment_per_month = await EnrollmentDAO.getThisYearCount_GroupedBy_month()
        let total_enrollment = await EnrollmentDAO.getCount("")

        return res.send({
            total_hit,
            success_hits,
            hit_per_month,
            enrollment_per_month,
            total_enrollment
        })

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function faceDetection(req: Request, res: Response, next: NextFunction) {

    try {
        let faceDetectionResponse = await request(`http://103.93.130.77:4004/NFFS-FD/v1/face-detection`, 'POST', req.body);

        if(faceDetectionResponse.description) {
            return next(new HandledInternalServerError(faceDetectionResponse.description, "INTERNAL_SERVER_ERROR"))
        }

        res.send(faceDetectionResponse)
    } catch (e) {
        next(new InternalServerError(e))
    }
}
