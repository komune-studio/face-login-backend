import {NextFunction, Request, Response} from "express";
import jwt, {Secret} from 'jsonwebtoken'
import {RequestError} from "../errors/RequestErrorCollection";
import crypto from "../utils/crypto";
import ApiKeyDAO from "../daos/ApiKeyDAO";


function verifyApiKey(part1:string, part2:string, part3:string){
    return crypto.hashSHA512withSecret(part1+part2, process.env.API_KEY_SECRET+'') === part3
}

const processToken = (req: Request, successCallback: Function, errorCallback: Function) =>{
    if(req.headers['authorization']){
        let token = req.headers['authorization'].split(" ")[1];
        // decode token
        if (token) {

            let secret = process.env.TOKEN_SECRET
            if(!secret) {
                errorCallback(new Error("NO_SECRET_DEFINED"))
            }

            // verifies secret and checks exp
            try {
                req.decoded = jwt.verify(token, <Secret>secret);
                successCallback();
            } catch (err) {
                console.log(err)
                let message = err.message
                message = message.toUpperCase().replace(" ", "_")
                errorCallback({msg: message,err: err})
            }


        } else {
            //token missing
            errorCallback({msg: "NO_TOKEN_PROVIDED"})
        }
    }else {
        //no header
        errorCallback({msg: "BAD_TOKEN_FORMAT"})
    }
}

function admin(req: Request, res: Response, next: NextFunction) {
    processToken(req, async () => {
        if (req.decoded.admin_id) {
            next()
        } else {
            return next(new RequestError("No admin data found in the token", 403, "NO_ADMIN_DATA"))
        }
    }, (err: any) => {
        //logger.error(err.err)
        return next(new RequestError("Refer to the code", 403, err.msg))
    })
}

function user(req: Request, res: Response, next: NextFunction) {
    processToken(req, async () => {
        if (req.decoded.user_id) {
            next()
        } else {
            return next(new RequestError("No user data found in the token", 403, "NO_USER_DATA"))
        }
    }, (err: any) => {
        //logger.error(err.err)
        return next(new RequestError("Refer to the code", 403, err.msg))
    })
}

function admin_user(req: Request, res: Response, next: NextFunction) {
    processToken(req, async () => {
        if (req.decoded.user_id || req.decoded.admin_id) {
            next()
        } else {
            return next(new RequestError("No data found in the token", 403, "NO_DATA"))
        }
    }, (err: any) => {
        //logger.error(err.err)
        return next(new RequestError("Refer to the code", 403, err.msg))
    })
}

function any(req: Request, res: Response, next: NextFunction) {
    processToken(req, async () => {
        if (req.decoded.authenticated) {
            next()
        } else {
            return next(new RequestError("No user/admin/vendor data found in the token", 403, "NO_AUTH_DATA"))
        }
    }, (err: any) => {
        //logger.error(err)
        return next(new RequestError(err.msg, 403, "Refer to the code"))
    })
}

function optional(req: Request, res: Response, next: NextFunction) {

    processToken(req, async () => {
        next()
    }, (err: any) => {
        req.decoded = {none:true}
        next()
    })
}

function developer(req: Request, res: Response, next: NextFunction) {

    if(!process.env.DEV_SECRET || process.env.DEV_SECRET?.length < 5) return next(new RequestError("Invalid auth", 403, "INVALID_AUTH"))

    if(req.headers['authorization'] === process.env.DEV_SECRET) next()
    else return next(new RequestError("Invalid auth", 403, "INVALID_AUTH"))
}

async function api_key(req: Request, res: Response, next: NextFunction) {
    try {

        let apiKey = req.headers['authorization']
        let parts = apiKey?.split('_')

        if(typeof apiKey !== "string") throw "ERROR"
        if(parts?.length !== 3) throw "ERROR"

        if(verifyApiKey(parts[0], parts[1], parts[2])){

            let gotApiKey = await ApiKeyDAO.getByKeyWithScope(apiKey)

            if(gotApiKey){
                req.api_scopes = gotApiKey.api_key_scopes.map((a:any)=> a.scope)
                req.api_key_id = gotApiKey.id
                return next()
            } else {
                return next(new RequestError("Invalid auth", 403, "INVALID_AUTH"))
            }

        }

        return next(new RequestError("Invalid api key format", 403, "INVALID_AUTH"))

    } catch (error) {
        console.log(error)
        return next(new RequestError("Invalid auth", 403, "INVALID_AUTH"))
    }
}

let api_key_scope = {
    DIVTIK: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("DIVTIK") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE")),
    SIM: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("SIM") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE")),
    IMIGRASI: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("IMIGRASI") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE")),
    DPO_BARESKRIM: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("DPO_BARESKRIM") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE")),
    INTERPOL: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("INTERPOL") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE")),
    FACE_ENROLLMENT: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("FACE_ENROLLMENT") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE")),
    FACE_MATCH: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("FACE_MATCH") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE")),
    FACE_DETECTION: (req: Request, res: Response, next: NextFunction) => req.api_scopes?.includes("FACE_DETECTION") ? next() : next(new RequestError("Invalid scope", 403, "INVALID_SCOPE"))
}




export default {
    admin,
    user,
    admin_user,
    any,
    optional,
    developer,
    api_key,
    api_key_scope
}
