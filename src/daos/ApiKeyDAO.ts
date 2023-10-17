import prisma from "../services/prisma";
import { api_keys as ApiKey, ApiType } from "@prisma/client";
import hidash from "../utils/hidash";
import { Mapped, OptionalKeys, RequiredKeys } from "../utils/types";
const model = prisma.api_keys

export type Required = Omit<RequiredKeys<ApiKey>, 'id' | 'created_at' | 'active'>
export type Optional = Omit<OptionalKeys<ApiKey>, 'modified_at'>
export type Create = Mapped<Required & Optional>
export type Edit = Omit<Create, 'password' | 'salt' | 'deleted_at'| 'key'>


function getRequired() {

    let formatted: Required = {
        key: "",
        name: ""
    }

    return Object.keys(formatted)
}

function formatCreate(x: any) {
    let obj: Create = {
        key: x.key,
        name: x.name,
        deleted_at: hidash.handleDate(x.deleted_at),
    }

    hidash.cleanDate(obj, "deleted_at")
    hidash.clean(obj)


    return obj
}

function formatEdit(x: any) {
    let obj: Edit = {
        name: x.name
    }

    hidash.cleanUndefined(obj)
    return obj
}


function format(x: any) {
    let obj: ApiKey = {
        id: x.id,
        key: x.key,
        name: x.name,
        active: x.active,
        created_at: new Date(x.created_at),
        modified_at: hidash.handleDate(x.modified_at),
        deleted_at: hidash.handleDate(x.deleted_at)
    }

    hidash.clean(obj)

    return obj
}

function getMulti(rows: any): ApiKey[] {
    return rows.map((r: any) => format(r))
}

function getSingle(row: any): ApiKey | null {
    if (!row) return null
    return format(row)
}

async function getAll() {
    return await model.findMany()
}

async function getAllCustom(page : number, limit : number){
    return await model.findMany({
        where: { deleted_at: null },
        skip: limit * page,
        take: limit
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

async function getByIdWithScopes(id: number) {
    let rows: any = await model.findUnique({
        where: { id },
        include: {api_key_scopes: true}
    })
    return rows
}

async function getByKey(key: string) {
    let rows: any = await model.findUnique({
        where: { key }
    })
    return rows
}

async function getByKeyWithScope(key: string) {
    let rows: any = await model.findFirst({
        where: { key, active: true, deleted_at: null },
        include: {api_key_scopes:true}
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
    getById, getByIdWithScopes,
    getAll, getAllCustom,
    getByKey, getByKeyWithScope,
    create,
    edit,
    getCount
}

