import {NextFunction, Request, Response} from "express";
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError,
    InternalServerError,
    UnauthorizedError
} from "../errors/RequestErrorCollection";
import ApiKeyDAO from "../daos/ApiKeyDAO";
import hidash from "../utils/hidash";
import crypto from "../utils/crypto";
import { ApiType } from "@prisma/client";
import ApiKeyScopesDAO from "../daos/ApiKeyScopesDAO";

export async function getById(req: Request, res: Response, next: NextFunction) {

    let id = parseInt(req.params.id)
    if (isNaN(id)) return next(new BadParamIdError)

    try {

        let ahl = await ApiKeyDAO.getByIdWithScopes(id)
        if (!ahl) return next(new EntityNotFoundError("ApiKey", id))
        if (ahl.deleted_at) return next(new EntityNotFoundError("ApiKey", id))

        return res.send(ahl)

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function getByKey(req: Request, res: Response, next: NextFunction) {

    let key = req.params.key
    if(!key) return next(new BadRequestError("No key", "NO_KEY"))

    try {

        let ak = await ApiKeyDAO.getByKey(key)
        if (!ak) return next(new EntityNotFoundError("ApiKey", key))
        if (ak.deleted_at) return next(new EntityNotFoundError("ApiKey", key))

        return res.send(ak)

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {

    let limit = parseInt(req.query.limit + '')
    let page = parseInt(req.query.page + '')

    if(!limit || !page) return next(new BadRequestError("No pagination param received", "NO_PAGINATION_PARAM"))

    try {
        let apikeys = await ApiKeyDAO.getAllCustom(page - 1, limit)
        
        let countResult = (await ApiKeyDAO.getCount())._count

        return res.send({
            apikeys,
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

    let scope = Array.isArray(req.body.scopes) ? req.body.scopes.filter((x:any)=> ApiType[<ApiType>x])  : undefined
    if(!scope) return next(new BadRequestError("No scope defined", "NO_SCOPE"))

    let newAK = ApiKeyDAO.formatCreate(req.body)

    let key1 = crypto.generateRandomStringWithLength(8)
    let key2 = crypto.generateRandomStringWithLength(8)
    newAK.key = `${key1}_${key2}_${crypto.hashSHA512withSecret(key1+key2, process.env.API_KEY_SECRET+'')}`

    let test = hidash.checkPropertyV2(newAK, "ApiKey", ApiKeyDAO.getRequired())
    if (test.error_message) return next(test)

    try {

        let createdAK = await ApiKeyDAO.create(newAK);

        let akScopes = scope.map((s:any)=> ApiKeyScopesDAO.formatCreate({api_key_id: createdAK.id, scope: s}))
        await ApiKeyScopesDAO.createBulk(akScopes)

        return res.send({...createdAK, scope})

    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }

}

export async function edit(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) return next(new BadParamIdError)
        let ak = await ApiKeyDAO.getByIdWithScopes(id)
        let akScopes = ak.api_key_scopes.map((a:any)=>a.scope)
        delete ak.api_key_scopes                

        if (!ak) return next(new EntityNotFoundError("ApiKey", id))

        let {name, scopes} = req.body

        if(name) ak.name = name

        let obj = await ApiKeyDAO.edit(id, ak)
        if (!obj) return res.send(new BadRequestError("Failed to change"))
        
        if(scopes){
            scopes = Array.isArray(scopes) ? scopes.filter((x:any)=> ApiType[<ApiType>x])  : []

            
            //update scope only if there is any differences to the current scope
            if(scopes.length !== akScopes.length || scopes.find((x:string)=> !akScopes.includes(x) )){
                let akScopes = scopes.map((s:any)=> ApiKeyScopesDAO.formatCreate({api_key_id: ak.id, scope: s}))

                await ApiKeyScopesDAO.deleteByApiKeyId(ak.id)
                await ApiKeyScopesDAO.createBulk(akScopes)
            }
            
        }
        

        return res.send({success: true})

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) return next(new BadParamIdError)
        let user = await ApiKeyDAO.getById(id)

        if (!user) return next(new EntityNotFoundError("ApiKey", id))

        let obj = await ApiKeyDAO.edit(id, {active: false})
        if (!obj) return res.send(new BadRequestError("Failed to change"))

        return res.send({success: true})

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function delete_(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) return next(new BadParamIdError)
        let user = await ApiKeyDAO.getById(id)

        if (!user) return next(new EntityNotFoundError("ApiKey", id))

        let obj = await ApiKeyDAO.edit(id, {active: false, deleted_at: new Date()})
        if (!obj) return res.send(new BadRequestError("Failed to change"))

        return res.send({success: true})

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function restore(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) return next(new BadParamIdError)
        let user = await ApiKeyDAO.getById(id)

        if (!user) return next(new EntityNotFoundError("ApiKey", id))

        let obj = await ApiKeyDAO.edit(id, {active: true})
        if (!obj) return res.send(new BadRequestError("Failed to change"))

        return res.send({success: true})

    } catch (e) {
        next(new InternalServerError(e))
    }
}
