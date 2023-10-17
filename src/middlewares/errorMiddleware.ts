import {NextFunction, Request, Response} from "express";
import {InternalServerError, RequestError} from "../errors/RequestErrorCollection";

export default (error: Error, req: Request,res: Response, next: NextFunction) => {
    let preparedErr: RequestError
    if(error instanceof RequestError) {
        //console.log("Aa")
        preparedErr = error
    } else {
        preparedErr = new InternalServerError(error)
    }

    res.status(preparedErr.http_code).send(preparedErr)

}