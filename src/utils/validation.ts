const checkParseJsonAllowNull = (str: string) => {
    if(!str) {
        return true
    }
    try{
        let t = JSON.parse(str)

        if(t && typeof t === 'object') {
            return true
        }
    } catch (e) {}
    return false;
}

/**
 * If thing is valid json, it will return itself. if thing is valid object, it will stringify and return the json. if its invalid json, it will return false
 *
 * @param thing
 * @returns {string}
 */
const getJsonStringOrStringifyObject = (thing: any) => {
    if(typeof thing === "object"){
        return JSON.stringify(thing)
    } else {
        if(checkParseJsonAllowNull(thing)) {
            return thing
        } else {
            throw "invalid"
        }
    }
}

/**
 * If thing is JSON, it will return itself. If thing is JSON String, it will return JSON
 *
 * @param thing
 * @returns {string}
 */




const isValidHTTPURL = (str: string) => {
    let url;
    try {
        url = new URL(str)
    } catch (e) {
        return false
    }

    return url.protocol === "http:" || url.protocol === "https:";
}


/**
 *
 * @param {string} url
 * return {string}
 */
const enforceLinkWithProtocol = (url: string) =>{
    if(url.toLowerCase().includes("https://") || url.toLowerCase().includes("http://")) {
        return url
    } else {
        return "https://" + url
    }
}


const isEmailValid = (email: string) =>{
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// const duplicateEmail = async(email:string):Promise<boolean>=>{
//     if(await PatientDAO.getByEmail(email)){
//         return true
//     }

//     if(await MedicDAO.getByEmail(email)){
//         return true
//     }

//     if(await DoctorDAO.getByEmail(email)){
//         return true
//     }

//     return false
// }

export default {
    checkParseJsonAllowNull,
    getJsonStringOrStringifyObject,
    isValidHTTPURL,
    enforceLinkWithProtocol,
    isEmailValid,
}