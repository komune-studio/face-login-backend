import prisma from "../services/prisma";
const model = prisma.skck_requests

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

async function _delete(id : string) {
    let result = await model.deleteMany({
        where: {
            user_id: id
        }
    })
    return result
}

export default {
    create,
    getById,
    _delete
}

