import prisma from "../services/prisma";
import { api_hit_logs as ApiHitLog, ApiType } from "@prisma/client";
import hidash from "../utils/hidash";
import { Mapped, OptionalKeys, RequiredKeys } from "../utils/types";
const model = prisma.api_hit_logs

export type Required = Omit<RequiredKeys<ApiHitLog>, 'id' | 'created_at' | 'active'>
export type Optional = Omit<OptionalKeys<ApiHitLog>, 'modified_at'>
export type Create = Mapped<Required & Optional>
export type Edit = Omit<Create, 'password' | 'salt'>


function getRequired() {

    let formatted: Required = {
        api_key_id: 0,
        api_accessed: "DIVTIK"
    }

    return Object.keys(formatted)
}

function formatCreate(x: any) {
    let obj: Create = {
        api_key_id: x.api_key_id,
        api_accessed: ApiType[<ApiType>x.api_accessed]
    }

    hidash.clean(obj)
    return obj
}

function formatEdit(x: any) {
    let obj: Edit = {
        api_key_id: x.api_key_id,
        api_accessed: ApiType[<ApiType>x.api_accessed]
    }

    hidash.cleanUndefined(obj)


    return obj
}


function format(x: any) {
    let obj: ApiHitLog = {
        id: x.id,
        api_key_id: x.api_key_id,
        api_accessed: ApiType[<ApiType>x.api_accessed],
        created_at: new Date(x.created_at),
        
    }

    hidash.clean(obj)

    return obj
}

function getMulti(rows: any): ApiHitLog[] {
    return rows.map((r: any) => format(r))
}

function getSingle(row: any): ApiHitLog | null {
    if (!row) return null
    return format(row)
}

async function getAll() {
    return await model.findMany()
}

async function getAllCustom(page : number, limit : number){
    return await model.findMany({        
        skip: limit * page,
        take: limit,
        include:{api_key:{select:{name:true}}}
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

async function getByApiAccessed(api_accessed: string) {
    let rows: any = await model.findMany({
        where: { api_accessed: ApiType[<ApiType>api_accessed] }
    })
    return rows
}

async function getCount_GroupedBy_api_accessed() {
    let rows: any = await model.groupBy({
         by: ['api_accessed'],
         _count: true,
        
    })
    return rows
}

async function getThisYearCount_GroupedBy_api_accessed() {
    let rows: any = await prisma.$queryRaw`
    select api_accessed, 
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 1 THEN 1 END) january,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 2 THEN 1 END) february, 
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 3 THEN 1 END) march,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 4 THEN 1 END) april,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 5 THEN 1 END) may,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 6 THEN 1 END) june,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 7 THEN 1 END) july,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 8 THEN 1 END) august,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 9 THEN 1 END) september,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 10 THEN 1 END) october,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 11 THEN 1 END) november,
    SUM ( CASE WHEN (EXTRACT(MONTH FROM created_at)) = 12 THEN 1 END) december
    from api_hit_logs
    where EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now())
    group by api_accessed
    `
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
    getByApiAccessed,
    getAll,
    getAllCustom,
    getCount_GroupedBy_api_accessed,
    getThisYearCount_GroupedBy_api_accessed,
    create,
    edit,
    getCount
}

