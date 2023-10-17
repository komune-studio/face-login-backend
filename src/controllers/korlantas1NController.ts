import {NextFunction, Request, Response} from "express";
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError, HandledInternalServerError,
    InternalServerError,
    UnauthorizedError
} from "../errors/RequestErrorCollection";
import ApiHitLogDAO from "../daos/ApiHitLogDAO";
import hidash from "../utils/hidash";
import ApiKeyDAO from "../daos/ApiKeyDAO";
import enrollmentDAO from "../daos/EnrollmentDAO";
import {ApiType, Gender} from "@prisma/client";
import request from "../utils/api.utils";
import apiHitLogDAO from "../daos/ApiHitLogDAO";
const fs = require('fs');
let mockupResponse = fs.readFileSync('response_frs_sim.json', 'utf8');
mockupResponse = JSON.parse(mockupResponse)

export async function korlantas1N(req: Request, res: Response, next: NextFunction) {
    try {
        let getTokenResponse = await request(`http://frs.korlantas.polri.go.id/api/worker/get_token`, 'GET');

        if(getTokenResponse.result === 'error') {
            // @ts-ignore
            return next(new HandledInternalServerError(getTokenResponse.msg, "INTERNAL_SERVER_ERROR"))
        } else {
            // @ts-ignore
            const {token} = getTokenResponse;

            let getDataResponse = await request(`http://frs.korlantas.polri.go.id/api/worker/face_match_n_all`, 'POST', {...req.body, token});

            res.send(getDataResponse)

            apiHitLogDAO.create({
                api_key_id: req.api_key_id,
                api_accessed: ApiType.SIM
            })
        }
    } catch (e) {
        console.log('e', e)
    }
}
