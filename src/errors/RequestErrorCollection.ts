export class RequestError extends Error {

    http_code : number;
    code: string;
    timestamp: Date;
    message: string;
    error_message: string;
    extra_info?:string

    //Reference: https://javascript.info/custom-errors
    constructor(message: string, httpCode: number, code: string, timestamp: Date = new Date(), extra_info?:any) {
        super(message);
        this.http_code = httpCode;
        this.code = code;
        this.timestamp = timestamp;
        this.message = message
        this.error_message = message
        this.extra_info = extra_info
    }

}

interface sql_error_detail{
    stack:string[]
    message:string
    code:string
    errno:number
    sqlMessage:string
    sqlState:string
    index:string
    sql:string

    /* example:{
        "stack": [
            "Error: ER_DUP_ENTRY: Duplicate entry '1-2' for key 'doctor_patient_id'",
            "    at Query.Sequence._packetToError (/root/aryaguna-api-server/node_modules/mysql/lib/protocol/sequences/Sequence.js:47:14)",
            "    at Query.ErrorPacket (/root/aryaguna-api-server/node_modules/mysql/lib/protocol/sequences/Query.js:79:18)",
            "    at Protocol._parsePacket (/root/aryaguna-api-server/node_modules/mysql/lib/protocol/Protocol.js:291:23)",
            "    at Parser._parsePacket (/root/aryaguna-api-server/node_modules/mysql/lib/protocol/Parser.js:433:10)",
            "    at Parser.write (/root/aryaguna-api-server/node_modules/mysql/lib/protocol/Parser.js:43:10)",
            "    at Protocol.write (/root/aryaguna-api-server/node_modules/mysql/lib/protocol/Protocol.js:38:16)",
            "    at Socket.<anonymous> (/root/aryaguna-api-server/node_modules/mysql/lib/Connection.js:88:28)",
            "    at Socket.<anonymous> (/root/aryaguna-api-server/node_modules/mysql/lib/Connection.js:526:10)",
            "    at Socket.emit (events.js:315:20)",
            "    at Socket.EventEmitter.emit (domain.js:467:12)",
            "    --------------------",
            "    at Protocol._enqueue (/root/aryaguna-api-server/node_modules/mysql/lib/protocol/Protocol.js:144:48)",
            "    at Connection.query (/root/aryaguna-api-server/node_modules/mysql/lib/Connection.js:198:25)",
            "    at /root/aryaguna-api-server/src/services/DatabaseService.ts:45:44",
            "    at new Promise (<anonymous>)",
            "    at DatabaseService.query (/root/aryaguna-api-server/src/services/DatabaseService.ts:44:20)",
            "    at Object.<anonymous> (/root/aryaguna-api-server/src/daos/GlobalDAO.ts:4:38)",
            "    at Generator.next (<anonymous>)",
            "    at /root/aryaguna-api-server/src/daos/GlobalDAO.ts:8:71",
            "    at new Promise (<anonymous>)",
            "    at __awaiter (/root/aryaguna-api-server/src/daos/GlobalDAO.ts:4:12)"
        ],
        "message": "ER_DUP_ENTRY: Duplicate entry '1-2' for key 'doctor_patient_id'",
        "code": "ER_DUP_ENTRY",
        "errno": 1062,
        "sqlMessage": "Duplicate entry '1-2' for key 'doctor_patient_id'",
        "sqlState": "23000",
        "index": 0,
        "sql": "INSERT INTO `doctor_patient` (`doctor_id`, `patient_id`) VALUES ('1', '2');"

    } */
}

//For oopsies that we cannot handleh such as database query errors, etc
export class InternalServerError extends RequestError {

    detail: sql_error_detail;

    constructor(err: Error) {
        super("Internal Server Error", 500, "INTERNAL_SERVER_ERROR")
        let processedErr = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        if(processedErr.stack) {
            processedErr.stack = processedErr.stack.split("\n")
        }
        this.detail = processedErr
    }
}

//For oopsies that we expect may happen, but we caught, such as undefined value on checking where it is not possible to be undefined unless we made a mistake/bug.
export class HandledInternalServerError extends RequestError {
    constructor(message: string, code: string = "INTERNAL_SERVER_ERROR") {
        super(message, 500, code);
    }
}

export class BadRequestError extends RequestError {
    constructor(message: string, code: string = "BAD_REQUEST") {
        super(message, 400, code);
    }
}

export class PrismaValidationError extends RequestError {
    constructor(message: string, code: string = "BAD_REQUEST") {
        super(message, 401, code, new Date(), message.split('Argument'));
    }
}

export class BadParamIdError extends RequestError {
    constructor() {
        super("Param should be integer!", 400, "BAD_PARAM");
    }
}

export class UnauthorizedDataAccessError extends RequestError {
    constructor() {
        super("Unauthorized data access", 400, "UNAUTHORIZED_DATA_ACCESS");
    }
}

export class UnauthorizedError extends RequestError {
    constructor(message: string, code: string = "UNAUTHORIZED") {
        super(message, 401, code);
    }
}

export class EntityNotFoundError extends RequestError {
    constructor(entityName: string, entityReference?: string | number, timestamp: Date = new Date()) {
        let message : string = `${entityName.toUpperCase()} not found.`
        if(entityReference) {
            message = `${entityName.toUpperCase()} with reference/id [${entityReference}] not found.`
        }
        super(message, 404, `${entityName.toUpperCase()}_NOT_FOUND`, timestamp)
    }

}
