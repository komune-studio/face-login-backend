import {NextFunction, Request, Response} from "express";
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError,
    InternalServerError,
    UnauthorizedError
} from "../errors/RequestErrorCollection";
import ApiHitLogDAO from "../daos/ApiHitLogDAO";
import hidash from "../utils/hidash";
import ApiKeyDAO from "../daos/ApiKeyDAO";

export async function getById(req: Request, res: Response, next: NextFunction) {

    let id = parseInt(req.params.id)
    if (isNaN(id)) return next(new BadParamIdError)

    try {

        let ahl = await ApiHitLogDAO.getById(id)
        if (!ahl) return next(new EntityNotFoundError("ApiHitLog", id))

        return res.send(ahl)

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function getByApiAccessed(req: Request, res: Response, next: NextFunction) {

    let aac = req.params.api_accessed

    try {

        let ahl = await ApiHitLogDAO.getByApiAccessed(aac)

        return res.send(ahl)

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {

    
    let limit = parseInt(req.query.limit + '')
    let page = parseInt(req.query.page + '')

    if(!limit || !page) return next(new BadRequestError("No pagination param received", "NO_PAGINATION_PARAM"))

    try {
        let apihitlogs = await ApiHitLogDAO.getAllCustom(page - 1, limit)
        let countResult = (await ApiHitLogDAO.getCount())._count

        return res.send({
            apihitlogs,
            limit: limit,
            current_page: page,
            total_data: countResult,
            total_page: Math.ceil(countResult/limit)
        })
    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {

    let newAHL = ApiHitLogDAO.formatCreate(req.body)

    let test = hidash.checkPropertyV2(newAHL, "ApiHitLog", ApiHitLogDAO.getRequired())
    if (test.error_message) return next(test)

    try {

        if(! await ApiKeyDAO.getById(newAHL.api_key_id)) return next(new EntityNotFoundError("API_key", newAHL.api_key_id))
        let createdLog = await ApiHitLogDAO.create(newAHL);

        return res.send(createdLog)


    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }

}