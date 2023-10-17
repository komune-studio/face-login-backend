
import scheduler from 'node-schedule'
import { InternalServerError, UnauthorizedError } from './errors/RequestErrorCollection'
import hidash from './utils/hidash'
import _ from "lodash"
import Uploader from "./utils/uploadProvider"



// */1 * * * * = every 1 minute
// 0 0 * * * = everyday at 00:00



let EVERY_MONDAY = `0 0 * * MON`

export default {
    initiateJobs: async()=>{
            
    }
}

