declare namespace Express {
    interface Request{
        decoded?: any
        api_scopes?:string[]
        api_key_id?:string
    }
}