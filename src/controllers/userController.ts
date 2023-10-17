import {NextFunction, Request, Response} from "express";
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError,
    InternalServerError,
    UnauthorizedError
} from "../errors/RequestErrorCollection";
import UserDAO from "../daos/UserDAO";
import hidash from "../utils/hidash";
import crypto from "../utils/crypto";
import jwt, { Secret } from "jsonwebtoken";
import validation from "../utils/validation";
import { UserRole } from ".prisma/client";

export async function getById(req: Request, res: Response, next: NextFunction) {

    let id = parseInt(req.params.id)
    if (isNaN(id)) return next(new BadParamIdError)

    try {

        let user = await UserDAO.getById(id)
        if (!user) return next(new EntityNotFoundError("User", id))
        if (user.deleted_at) return next(new EntityNotFoundError("User", id))

        user.photo = Buffer.from(user.photo).toString('base64')

        return res.send(hidash.desensitizedFactory(user))

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function getSelf(req: Request, res: Response, next: NextFunction) {

    let id = parseInt(req.decoded.user_id)
    if (isNaN(id)) return next(new BadParamIdError)

    try {

        let user = await UserDAO.getById(id)
        if (!user) return next(new EntityNotFoundError("User", id))

        return res.send(hidash.desensitizedFactory(user))

    } catch (e) {
        next(new InternalServerError(e))
    }
}


export async function edit(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) return next(new BadParamIdError)

        let newUser = req.body

        let user = await UserDAO.getById(id)
        if (!user) return next(new EntityNotFoundError("User", id))
        if (user.deleted_at) return next(new EntityNotFoundError("User", id))


        newUser = UserDAO.formatEdit(newUser)

        let obj = await UserDAO.edit(id, newUser)


        return res.send({success: true})

    } catch (e) {
        e = new InternalServerError(e)

        next(e)
    }
}

export async function editSelf(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.decoded.user_id)
        if (isNaN(id)) return next(new BadParamIdError)

        let newUser = req.body

        let user = await UserDAO.getById(id)
        if (!user) return next(new EntityNotFoundError("User", id))
        if (user.deleted_at) return next(new EntityNotFoundError("User", id))


        newUser = UserDAO.formatEdit(newUser)

        let obj = await UserDAO.edit(id, newUser)


        return res.send({success: true})

    } catch (e) {
        e = new InternalServerError(e)

        next(e)
    }
}


export async function getAll(req: Request, res: Response, next: NextFunction) {



    let limit = parseInt(req.query.limit + '')
    let page = parseInt(req.query.page + '')

    if(!limit || !page) return next(new BadRequestError("No pagination param received", "NO_PAGINATION_PARAM"))

    try {
        let users = await UserDAO.getAllCustom(page - 1, limit)
        users = users.map((o:any)=> {
            o.photo = Buffer.from(o.photo).toString('base64'),
            hidash.desensitizedFactory(o)
            return o
        })

        let countResult = (await UserDAO.getCount())._count

        return res.send({
            users,
            limit: limit,
            current_page: page,
            total_data: countResult,
            total_page: Math.ceil(countResult/limit)
        }
)
    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {

    let newUser = UserDAO.formatCreate(req.body)
    newUser.salt = crypto.generateSalt()

    let test = hidash.checkPropertyV2(newUser, "User", UserDAO.getRequired())
    if (test.error_message) return next(test)

    if(!validation.isEmailValid(newUser.email)) return next(new BadRequestError("Invalid email format", "INVALID_EMAIL_FORMAT"))

    newUser.password = crypto.generatePassword(newUser.password, newUser.salt)
    newUser.role = UserRole[<UserRole>newUser.role] ?? UserRole.OPERATOR

    try {

        if(await UserDAO.getByEmail_NotDeleted(newUser.email)) return next(new BadRequestError("Duplicate email", "DUPLICATE_EMAIL"))

        console.log(newUser)

        let createdUser = await UserDAO.create(newUser);
        return res.send(hidash.desensitizedFactory(createdUser))


    } catch (e) {
        e = new InternalServerError(e)
        next(e)
    }

}



export async function deactivate(req: Request, res: Response, next: NextFunction) {

    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) return next(new BadParamIdError)
        let user = await UserDAO.getById(id)

        if (!user) return next(new EntityNotFoundError("User", id))
        if (user.deleted_at) return next(new EntityNotFoundError("User", id))

        let obj = await UserDAO.edit(id, {active: false})
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
        let user = await UserDAO.getById(id)

        if (!user) return next(new EntityNotFoundError("User", id))
        if (user.deleted_at) return next(new EntityNotFoundError("User", id))

        let obj = await UserDAO.edit(id, {active: false, deleted_at: new Date()})
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
        let user = await UserDAO.getById(id)

        if (!user) return next(new EntityNotFoundError("User", id))
        if (user.deleted_at) return next(new EntityNotFoundError("User", id))

        let obj = await UserDAO.edit(id, {active: true})
        if (!obj) return res.send(new BadRequestError("Failed to change"))

        return res.send({success: true})

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {

    let { new_password, password } = req.body

    let { id } = req.params;

    if (!new_password || !password)
        return next(new BadRequestError("MISSING_CREDENTIAL"))

    try {
        let user = await UserDAO.getById(parseInt(id))

        if (!user) return next(new EntityNotFoundError("User"))
        if (user.deleted_at) return next(new EntityNotFoundError("User", id))

        let processedPassword = crypto.generatePassword(password, user.salt)

        if (processedPassword !== user.password) {
            return next(new UnauthorizedError("Wrong password", "PASSWORD_WRONG"))
        }

        let newSalt = crypto.generateSalt();

        let newProcessedPassword = crypto.generatePassword(new_password, newSalt);

        let newUser = UserDAO.format({...user, password: newProcessedPassword, salt: newSalt})

        let o = await UserDAO.edit(parseInt(id), newUser);

        let desensitized: any = hidash.desensitizedFactory(o)

        res.send(desensitized);
    } catch (e) {
        res.send(e)
    }
}

export async function getBynrp(req: Request, res: Response, next: NextFunction) {

    let nrp = req.params.nrp
    if (!nrp) return next(new BadRequestError("No NRP", "NO_NRP"))

    try {

        let users = await UserDAO.getBynrp_NotDeleted(nrp)
        users = users.map((o: any) => hidash.desensitizedFactory(o))
        return res.send(users)

    } catch (e) {
        next(new InternalServerError(e))
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    let { email, password } = req.body

    if (!email || !password)
        return next(new BadRequestError("MISSING_LOGIN_CREDENTIAL"))

    try {

        let user = await UserDAO.getByEmail_NotDeleted(email)

        if (!user)
            return next(new BadRequestError("EMAIL_NOT_FOUND"))

        if (!user.salt || !user.password) {
            return next(new Error("CREDENTIAL_CORRUPT"))
        }

        if(user.photo) {
             user.photo = Buffer.from(user.photo).toString('base64');
        }

        if (!user.active) return next(new BadRequestError("User is disabled, please contact administrator", "BANNED"))

        let processedPassword = crypto.generatePassword(password, user.salt)

        if (processedPassword !== user.password) {
            return next(new UnauthorizedError("Wrong password", "PASSWORD_WRONG"))
        }

        let desensitizedOrg: any = hidash.desensitizedFactory(user)

        desensitizedOrg.token = jwt.sign({
            authenticated: true,
            user_id: user.id,
            email: user.email
        }, <Secret>process.env.TOKEN_SECRET, {
            expiresIn: "90d"
        })

        return res.send(desensitizedOrg)

    } catch (e) {
        return next(e)
    }

}
