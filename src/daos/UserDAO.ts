import prisma from "../services/prisma";
import { users as User, UserRole } from "@prisma/client";
import hidash from "../utils/hidash";
import { Mapped, OptionalKeys, RequiredKeys } from "../utils/types";
const model = prisma.users

export type Required = Omit<RequiredKeys<User>, 'id' | 'created_at' | 'active' | 'is_from_association'>
export type Optional = Omit<OptionalKeys<User>, 'modified_at'>
export type Create = Mapped<Required & Optional>
export type Edit = Omit<Create, 'password' | 'salt' | 'deleted_at'>


function getRequired() {

    let formatted: Required = {
        name: "",
        password: "",
        salt: "",
        nrp: "",
        photo: Buffer.from(""),
        role: UserRole.OPERATOR,
        email: ""
    }

    return Object.keys(formatted)
}

function formatCreate(x: any) {
    let obj: Create = {
        email: x.email,
        nrp: x.nrp,
        name: x.name,
        password: x.password,
        salt: x.salt,
        photo: Buffer.from(x.photo, 'base64'),
        role: UserRole[<UserRole>x.role],
        deleted_at: hidash.handleDate(x.deleted_at),
    }

    hidash.cleanDate(obj, "deleted_at")
    hidash.clean(obj)


    return obj
}

function formatEdit(x: any) {
    let obj: Edit = {
        email: x.email,
        nrp: x.nrp,
        name: x.name,
        photo: Buffer.from(x.photo, 'base64'),
        role: UserRole[<UserRole>x.role]
    }

    hidash.cleanUndefined(obj)


    return obj
}


function format(x: any) {
    let obj: User = {
        id: x.id,
        email: x.email,
        nrp: x.nrp,
        name: x.name,
        photo: x.photo,
        password: x.password,
        salt: x.salt,
        active: x.active,
        role: UserRole[<UserRole>x.role],
        created_at: new Date(x.created_at),
        modified_at: hidash.handleDate(x.modified_at),
        deleted_at: hidash.handleDate(x.deleted_at),
    }

    hidash.clean(obj)

    return obj
}

function getMulti(rows: any): User[] {
    return rows.map((r: any) => format(r))
}

function getSingle(row: any): User | null {
    if (!row) return null
    return format(row)
}

async function getAll() {
    return await model.findMany()
}

async function getAll_Active() {
    return await model.findMany({ where: { active: true } })
}

async function getAll_Active_NotDeleted() {
    return await model.findMany({ where: { active: true, deleted_at: null } })
}

async function getAllCustom(page : number, limit : number){
    return await model.findMany({
        where: { deleted_at: null },
        skip: limit * page,
        take: limit,

    })
}

async function getCount() {
    return await model.aggregate({
        _count: true
    })
}


async function getById(id: number) {
    let rows: any = await model.findUnique({
        where: { id }
    })
    return rows
}

async function getBynrp(nrp: string) {
    let rows: any = await model.findMany({
        where: {nrp}
    })
    return rows
}

async function getBynrp_NotDeleted(nrp: string) {
    let rows: any = await model.findMany({
        where: {nrp}
    })
    return rows
}

async function getByEmail(email: string) {
    let rows: any = await model.findMany({
        where: {email}
    })
    return rows
}

async function getByEmail_NotDeleted(email: string) {
    let rows: any = await model.findFirst({
        where: {email, deleted_at: null}
    })
    return rows
}

async function getByEmail_Active_NotDeleted(email: string) {
    let rows: any = await model.findFirst({
        where: {email, active:true, deleted_at: null}
    })
    return rows
}

async function edit(id: number, object: any) {
    let result = await model.update({
        data: {
            ...object,
            modified_at: new Date()
        },
        where: { id }
    })
    return result
}

async function create(obj: any) {
    let result = await model.create({
        data: obj
    })
    return result
}


export default {
    format,
    formatCreate,
    formatEdit,
    getRequired,
    getById,
    getBynrp, getBynrp_NotDeleted,
    getAll,
    create,
    edit,
    getAll_Active, getAll_Active_NotDeleted, getAllCustom,
    getByEmail, getByEmail_Active_NotDeleted, getByEmail_NotDeleted,
    getCount
}

