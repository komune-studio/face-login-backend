'use strict'

import crypto from 'crypto'
//const {v4: generateV4UUID} = require("uuid");

const hashSHA1 = (str: string) => {
    return crypto.createHash('sha1').update(str).digest('hex')
}

const hashSHA512 = (str: string) =>{
    return crypto.createHash('sha512').update(str).digest('hex')
}

export default {

    generateSalt: () => {
        return crypto.randomBytes(20).toString('hex')
    },
    generatePassword: (password : string, salt: string) => {
        return hashSHA1(salt + password)
    },

    generateRandomString : () =>{
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const s = Array.from({length:20}, _ => c[Math.floor(Math.random()*c.length)]).join('')
        return s;
    },

    generateRandomStringWithLength : (length:number) => {
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const s = Array.from({length:length}, _ => c[Math.floor(Math.random()*c.length)]).join('')
        return s;
    },

    hashSHA1 : hashSHA1,
    hashSHA512 : hashSHA512,

    simpleEncryptString: (message: string, key: string) => {
        let cipher = crypto.createCipher('aes-128-cbc', key)
        let result = cipher.update(message, "utf8", 'hex');
        result += cipher.final('hex')
        return result
    },

    simpleDecryptString: (encryptedString: string, key: string) => {
        let decipher = crypto.createDecipher('aes-128-cbc', key);
        let result = decipher.update(encryptedString, 'hex', 'utf8')
        result += decipher.final('utf8');

        return result;
    },

    hashSHA512withSecret: (str:string, secret:string) =>{
        //@ts-ignore
        return crypto.createHash('sha512', secret).update(str).digest('hex')
    }

    // generateGUID: () => {
    //     return generateV4UUID()
    // }
}
