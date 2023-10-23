import prisma from "../services/prisma";
import {enrollments as Enrollment, Gender} from "@prisma/client";
import hidash from "../utils/hidash";
import {Mapped, OptionalKeys, RequiredKeys} from "../utils/types";

const model = prisma.enrolled_ids

export type Required = Omit<RequiredKeys<Enrollment>, 'id' | 'created_at' | 'active'>
export type Optional = Omit<OptionalKeys<Enrollment>, 'modified_at'>
export type Create = Mapped<Required & Optional>
export type Edit = Omit<Create, 'password' | 'salt' | 'deleted_at'>


function getRequired() {

    let formatted: Required = {
        name: "",
        photo: Buffer.from(""),
        identity_number: ""
    }

    return Object.keys(formatted)
}

function formatCreate(x: any) {
    let obj: Create = {
        name: x.name,
        photo: x.photo,
        identity_number: x.identity_number,
        gender: Gender[<Gender>x.gender],
        driver_license_number: x.driver_license_number,
        passport_number: x.passport_number,
        deleted_at: hidash.handleDate(x.deleted_at)
    }

    hidash.cleanDate(obj, "deleted_at")
    hidash.clean(obj)


    return obj
}

function formatEdit(x: any) {
    let obj: Edit = {
        name: x.name,
        photo: x.photo,
        identity_number: x.identity_number,
        gender: Gender[<Gender>x.gender],
        driver_license_number: x.driver_license_number,
        passport_number: x.passport_number
    }

    hidash.cleanDate(obj, "deleted_at")
    hidash.cleanUndefined(obj)


    return obj
}


function format(x: any) {
    let obj: Enrollment = {
        id: x.id,
        name: x.name,
        photo: x.photo,
        identity_number: x.identity_number,
        gender: Gender[<Gender>x.gender],
        driver_license_number: x.driver_license_number,
        passport_number: x.passport_number,
        created_at: new Date(x.created_at),
        modified_at: hidash.handleDate(x.modified_at),
        deleted_at: hidash.handleDate(x.deleted_at)
    }

    hidash.clean(obj)

    return obj
}

function getMulti(rows: any): Enrollment[] {
    return rows.map((r: any) => format(r))
}

function getSingle(row: any): Enrollment | null {
    if (!row) return null
    return format(row)
}


async function getById(id: string) {
    let rows: any = await model.findUnique({
        where: {id: id}
    })
    return rows
}

async function getAll(page : number, limit : number, search : string | undefined) {
    return await model.findMany({
        where: {id:  {contains: search, mode: 'insensitive'}},
        skip: limit * page,
        take: limit,
        orderBy: {id: 'asc'}
    })
}


async function edit(id: string , object: any) {
    let result = await model.update({
        data: {
            ...object,
        },
        where: {id : id}
    })
    return result
}

async function create(obj: any) {
    let result = await model.create({
        data: obj
    })
    return result
}

async function getThisYearCount_GroupedBy_month() {
    let rows: any = await prisma.$queryRaw`
    SELECT
    EXTRACT(month FROM created_at) month_num , count (id) count
    from enrollments
	where EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now())
	and deleted_at is null
    group by EXTRACT(month FROM created_at)
    `
    return rows
}

async function _delete (id: string)  {
    let result = await model.delete({
        where: {
            id: id
        }
    })
    return result
}

async function getCount(search: string) {
    return model.aggregate({
        _count: {
            id: true
        },
        where: {
            OR: [
                {
                    id: {
                        contains: search,
                    }
                }
            ]
        }
    });
}


export default {
    getCount,
    format,
    formatCreate,
    formatEdit,
    getRequired,
    getById,
    _delete,
    getThisYearCount_GroupedBy_month,
    create,
    edit,
    getAll
}

