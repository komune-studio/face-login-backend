import moment from "moment";
import {BadRequestError} from "../errors/RequestErrorCollection";

const listBulan = ['Januari','Februrari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const listHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const generateZeroPaddedNumber = (value:number|string) : string => {
    let pad = '00'
    return (pad + value).slice(-pad.length)
}

const generateFormattedTime = (time: moment.Moment) : string => {
    return generateZeroPaddedNumber(time.hour()) + "." + generateZeroPaddedNumber(time.minute())
}


function isDate(date:any) {
    if(date == null) return false
    //@ts-ignore
    return (new Date(date) != "Invalid Date") && !isNaN(new Date(date))
}

export default {
    clean:(obj: any)=>{
        let propNames = Object.getOwnPropertyNames(obj);
        for (let i = 0; i < propNames.length; i++) {
            let propName = propNames[i];
            if (obj[propName] === null || obj[propName] === undefined) {
                delete obj[propName];
            }
        }
        return obj
    },
    cleanInvaliDate:(obj: any, ...props:string[])=>{
        for (let p of props) {
            if(!isDate(obj[p])){
                delete obj[p];
            }
        }
        return obj
    },
    cleanDate:(obj: any, ...props:string[])=>{
        for (let p of props) {
            if( !isDate(obj[p]) || new Date(p).getFullYear() === 1970){
                delete obj[p];
            }
        }
        return obj
    },
    cleanUndefined:(obj: any)=>{
        let propNames = Object.getOwnPropertyNames(obj);
        for (let i = 0; i < propNames.length; i++) {
            let propName = propNames[i];
            if (obj[propName] === undefined) {
                delete obj[propName];
            }
        }
        return obj
    },
    getJsonObjectOrIgnoreIfAlreadyJSON : (thing: any) => {
        if(typeof thing === "object"){
            return thing
        } else {
            return JSON.parse(thing)
        }
    },
    checkProperty: (thing:any, object_name:string, ...property:string[])=>{

        for(let key of property){
            if(thing[key] == null) //null or undefined
                return (new BadRequestError(`New ${key} for new ${object_name} is missing`, "MISSING_INFO"))
        }
        return thing
    },
    checkPropertyV2: (thing:any, object_name:string, property:string[])=>{

        for(let key of property){
            if(thing[key] == null) //null or undefined
                return (new BadRequestError(`New ${key} for new ${object_name} is missing`, "MISSING_INFO"))
        }
        return thing
    },
    
    nowPlusHour:(n:number)=>{
        let now = new Date()
        return new Date(now.setHours(now.getHours() + n))
    },
    nowMinusHour:(n:number)=>{
        let now = new Date()
        return new Date(now.setHours(now.getHours() - n))
    },
    nowMinusMinute: (n: number) => {
        let now = new Date()
        return new Date(now.setMinutes(now.getMinutes() - n))
    },
    nowPlusDay:(n:number)=>{
        let now = new Date()
        return new Date(now.setDate(now.getDate() + n))
    },
    dynamicSort(property:string, ascending:boolean) {
        let sortOrder = ascending? 1 : -1;

        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }

        return function (a:any,b:any) {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    },
    desensitizedFactory (o:any) {
        delete o.password
        delete o.salt
        // delete o.uuid
        delete o.password_reset_token
        delete o.password_reset_token_expired_at
        delete o.otp
        return o
    },
    isDate: isDate,
    handleDate(o:any){
        return this.isDate(o) ? new Date(o) : null
    },
    checkPropertyDate: (thing:any, object_name:string, ...property:string[])=>{

        for(let key of property){
            if(!isDate(thing[key])){
                return (new BadRequestError(`New ${key} for new ${object_name} is not a valid date`, "INVALID_DATE_PROP"))
            }
                
        }
        return thing
    },
    generateDateIndonesianString: (inputDate: Date) => {
        let date = inputDate.getDate()
        let month = listBulan[inputDate.getMonth()]
        let year = inputDate.getFullYear();
        return `${date} ${month} ${year}`
    },
    generateDateTimeIndonesianString: (time: Date) : string => {
        let mest = moment(time).utcOffset('+0700')
        let date = time.getDate()
        let month = listBulan[time.getMonth()]
        let year = time.getFullYear()
        let day = mest.format("dddd")
    
        let timeStr = generateFormattedTime(mest)
        return `${day}, ${date} ${month} ${year}, pukul ${timeStr} WIB`
    },
    generateDateTimeIndonesianStringCompleteEdition: (startTime: Date, endTime: Date) : string => {
        let momentStart = moment(startTime).utcOffset('+0700')
        let momentEnd = moment(endTime).utcOffset('+0700')
        let date = startTime.getDate()
        let month = listBulan[startTime.getMonth()]
        let year = startTime.getFullYear()
        let day = momentStart.format("dddd")
    
        let startTimeStr = generateFormattedTime(momentStart)
        let endTimeStr = generateFormattedTime(momentEnd)
        return `${day}, ${date} ${month} ${year}, pukul ${startTimeStr}--${endTimeStr} WIB`
    },
    convertDateToUnixTimeStamp(d:Date){
        return Math.floor(d.getTime() / 1000)
    },
    getCurrentWeekNumber(){
        let currentDate = new Date();
        let startDate = new Date(currentDate.getFullYear(), 0, 1);
        
        let days = Math.floor(( +currentDate - +startDate) /(24 * 60 * 60 * 1000));
         
        return Math.ceil(days / 7);
    },
    getCurrentYearFirstDate(){
        let x=  new Date()
        return new Date(x.getFullYear(), 0, 1)
    },
    getYearEndDate(year:number){
        return new Date(year, 11, 31)
    },
    getCurrentYear(){
        return new Date().getFullYear()
    },
    getCurrentMonth(){
        return new Date().getMonth()
    },
    getCurrentMonthDate(){
        let x=  new Date()
        return new Date(x.getFullYear(), x.getMonth(), 1)
    },
    getMondayOfTheWeek(){
        let d = new Date();
        let day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        d.setHours(0,0,0,0)
        return new Date(d.setDate(diff));
    },
    getDayName(d:Date){
        return new Date(d).toLocaleString('en-us', {weekday:'long'})
    },
    chunk(arr:any[], chunkSize:number) {
        if (chunkSize <= 0) throw "Invalid chunk size";
        var R = [];
        for (var i=0,len=arr.length; i<len; i+=chunkSize)
          R.push(arr.slice(i,i+chunkSize));
        return R;
    },
    selectProp(obj:any, props:string[]){
        let x:any = {}
        for(let p of props) x[p] = obj[p]
        return x
    },
    generateDateRange(startDate: Date, endDate: Date) {

        const dates = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate).toISOString());
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;

    }
    
}
