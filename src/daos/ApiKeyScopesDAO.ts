import prisma from "../services/prisma";
import { api_key_scopes as ApiKeyScope, ApiType } from "@prisma/client";
import hidash from "../utils/hidash";
import { Mapped, OptionalKeys, RequiredKeys } from "../utils/types";
const model = prisma.api_key_scopes

export type Required = Omit<RequiredKeys<ApiKeyScope>, 'id' | 'created_at' | 'active'>
export type Optional = Omit<OptionalKeys<ApiKeyScope>, 'modified_at'>
export type Create = Mapped<Required & Optional>
export type Edit = Omit<Create, 'password' | 'salt'>


function getRequired() {

    let formatted: Required = {
        api_key_id: 0,
        scope: "DIVTIK"
    }

    return Object.keys(formatted)
}

function formatCreate(x: any) {
    let obj: Create = {
        api_key_id: x.api_key_id,
        scope: ApiType[<ApiType>x.scope]
    }

    hidash.clean(obj)
    return obj
}

function formatEdit(x: any) {
    let obj: Edit = {
        api_key_id: x.api_key_id,
        scope: ApiType[<ApiType>x.scope]
    }

    hidash.cleanUndefined(obj)
    return obj
}


function format(x: any) {
    let obj: ApiKeyScope = {
        id: x.id,
        api_key_id: x.api_key_id,
        scope: ApiType[<ApiType>x.scope],
        created_at: new Date(x.created_at),
    }

    hidash.clean(obj)

    return obj
}

function getMulti(rows: any): ApiKeyScope[] {
    return rows.map((r: any) => format(r))
}

function getSingle(row: any): ApiKeyScope | null {
    if (!row) return null
    return format(row)
}

async function getAll() {
    return await model.findMany()
}


async function getById(id: number) {
    let rows: any = await model.findUnique({
        where: { id }
    })
    return rows
}

async function getByApiKeyId(api_key_id: number) {
    let rows: any = await model.findMany({
        where: { api_key_id }
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

async function createBulk(obj: any[]){
    let result = await model.createMany({
        data:obj
    })
    return result
}

async function deleteByApiKeyId(api_key_id:number){
    let result = await model.deleteMany({
        where:{api_key_id}
    })
    return result
}


export default {
    format,
    formatCreate,
    formatEdit,
    getRequired,
    getById,
    getByApiKeyId,
    getAll,    
    create, createBulk,
    edit,
    deleteByApiKeyId
}

