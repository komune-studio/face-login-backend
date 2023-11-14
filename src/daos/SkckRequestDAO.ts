import prisma from "../services/prisma";
import { api_keys as ApiKey, ApiType } from "@prisma/client";
import hidash from "../utils/hidash";
import { Mapped, OptionalKeys, RequiredKeys } from "../utils/types";
const model = prisma.skck_requests

export type Required = Omit<RequiredKeys<ApiKey>, 'id' | 'created_at' | 'active'>
export type Optional = Omit<OptionalKeys<ApiKey>, 'modified_at'>
export type Create = Mapped<Required & Optional>
export type Edit = Omit<Create, 'password' | 'salt' | 'deleted_at'| 'key'>

async function getById(id : string) {
    let result = await model.findMany({
        where: {user_id: id},
        orderBy: {created_at: 'desc'}
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
    create,
    getById
}

