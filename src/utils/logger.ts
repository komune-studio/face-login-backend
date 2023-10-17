// 'use strict'

// import {AxiosError} from "axios";

// /**
//  * GUIDE TO INSTALLING intellivent-reporter-client
//  * LINUX: https://docs.gitlab.com/ee/ssh/
//  * WINDOWS: https://gist.github.com/bsara/5c4d90db3016814a3d2fe38d314f9c23 (change the "variables" to gitlab)
//  *
//  * In a nutshell:
//  * 1) Generate public key and private key using ssh-keygen
//  * 2) Store the PUBLIC KEY (.pub file) in your user's configuration in gitlab
//  * 3) Configure the config file: ~/.ssh/config so it contains:
//  *      Host gitlab.com
//  *          Preferredauthentications publickey
//  *          IdentityFile ~/.ssh/my_key_name
//  *
//  * 4) For Windows, there is another step required. follow the gist.github link
//  * 5) Try to ssh -T git@gitlab.com and accept the fingerprint. Then do it one more time. If correctly configured, it should return a greeting with your username in it.
//  * e.g Welcome, @blowfishlol!
//  */

// //const IntelliventReporter = require("@intellivent/intellivent-reporter-client").IntelliventReporter;
// //const reporterClient = new IntelliventReporter(process.env.REPORTING_SYSTEM_URL, process.env.FOREVER_UID);

// const loggingLevels = ["DEBUG", "LOG", "WARN","ERROR", "FATAL"];
// const loggingLevelMode = 1;
// //0: debug, 1: log, 2: warn, 3: ERROR, 4:fatal

// let isWin = process.platform === "win32";

// const generateStringLog = (severity: string, source: string, message: any) => {
//     let processedMessage = ""
//     if(message instanceof Error) {
//         processedMessage += `Stack:\n${message.stack}\n------`
//     } else if (message instanceof Array || message instanceof Object){
//         processedMessage = `Object/Array:\n${JSON.stringify(message, null, 2)}\n-----`
//     } else {
//         processedMessage = message
//     }
//     let logString = `[${new Date().toLocaleString()}][${severity}] ${source} : ${processedMessage}`;
//     return logString
// }
// const getSource = () => {
//     let e : Error = new Error();
//     // @ts-ignore
//     let frame = e.stack.split("\n")[3];
//     //let lineNumber = frame.split(":")[1]
//     let splitString = isWin ? "\\" : "/";
//     let functSplit = frame.split(splitString);
//     let functName = functSplit[functSplit.length - 1];
//     return functName.replace(")", "")
// }
// export default {

//     reporterClientInstance: reporterClient,

//     debug: (msg : any) => {
//         let caller = getSource();
//         let errorString = generateStringLog("DEBUG",caller,msg);
//         if(0 >= loggingLevelMode) {
//             console.debug(errorString)
//         }
//         //put to file
//     },

//     log: (msg : any) => {
//         let caller = getSource();
//         let errorString = generateStringLog("LOG", caller, msg);
//         if(1 >= loggingLevelMode) {
//             console.log(errorString)
//         }
//     },
//     warn: (msg : any) => {
//         let caller = getSource();
//         let errorString = generateStringLog("WARN", caller, msg);
//         if(2 >= loggingLevelMode) {
//             console.warn(errorString)
//         }
//     },

//     error: (msg : any, shouldReport=true) => {
//         let caller = getSource();
//         let errorString = generateStringLog("ERROR", caller, msg);

//         if(shouldReport) {
//             reporterClient.error(errorString).catch((e: AxiosError)=>{
//                 console.log("[REPORTING CLIENT ERROR]",e?.response?.data)
//             })
//         }

//         if(3 >= loggingLevelMode) {
//             console.error(errorString)
//         }
//     },
//     fatal: (msg: any) => {
//         let caller = getSource();
//         let errorString = generateStringLog("FATAL", caller, msg);
//         if(4 >= loggingLevelMode) {
//             console.log(errorString)
//         }
//     }
// };
