
import nodemailer, {SentMessageInfo} from 'nodemailer'
import moment from 'moment'
import {Stream} from "stream";
import cryptoUtils from "../utils/crypto";

require('moment/locale/id')

const USER = process.env.MAILJET_USERNAME
const PASS = process.env.MAILJET_PASSWORD
const SERVICE = 'Mailjet'
// import 'moment/locale/id'

const replaceEmailTemplate = (replacer: any, emailTemplate: string) => {
    let oldTemplate = emailTemplate
    do{
        oldTemplate = emailTemplate
        for(let key in replacer) {
            emailTemplate = emailTemplate.replace(`%${key}%`, replacer[key])
        }
    } while (emailTemplate !== oldTemplate)

    return emailTemplate
}

interface MailAttachment {
    filename?: string,
    content?: string|Buffer|Stream,
    path?: string,
    encoding?: string,
    raw?:string
}

interface IAdditionalConfiguration {
    attachments?: MailAttachment[],
    replyTo?:string,
    textMode?:boolean, //If true, will pass email as text. if false, will pass email as RichText/HTML
    fromDomain?:string,
    fromName?:string
}

const sendEmailAsync = async (to:string, subject:string, body:string, config?: IAdditionalConfiguration) : Promise<SentMessageInfo> => {

    let fromDomain = config?.fromDomain ?? 'intellivent.id'
    let fromName = config?.fromName ?? 'Indonesia 4.0 registration'
    let from = `${fromName}@${fromDomain}`

    let mailOptions : any = {
        from: from,
        to: to,
        subject: subject,
    };

    if(config?.replyTo) {
        mailOptions.replyTo = config?.replyTo
    }

    if(config?.textMode) {
        mailOptions.text = body
    } else {
        mailOptions.html = body
    }

    if(config?.attachments){
        if(config.attachments.length > 0){
            mailOptions.attachments = config.attachments
        }
    }

    let transporter = nodemailer.createTransport({
        service: SERVICE,
        auth: {
            user: USER,
            pass: PASS
        }
    })

    let result : SentMessageInfo = await transporter.sendMail(mailOptions)
    {
        response: "TEST-"+ cryptoUtils.generateSalt() + " EMAILTEST"
    }

    console.log(result)

    let guid = result.response.split(" ").pop()

    console.log(`Sent email to [${to}] with subject [${subject}]. EMAIL GUID: ${guid}`)



    /*let emailStatus = new EmailStatus({
        email_guid: guid,
        from_address: from,
        to_address: to,
        subject: subject,
        content: text,
        status: EmailStatus.statuses.SENT
    }, ModelModes.CREATE)

    //catch this error so that it doesnt break the user-end flow
    try{
        await EmailStatus.create(emailStatus)
    } catch (err) {
        console.error(err)
    }*/

    return result

}





export default {
    sendEmailAsync,
    replaceEmailTemplate
}

/*const replaceBodyAndSubject = (context: OrderContext, emailTemplate: EmailTemplate, rejectionReason?: string) => {
    let replacer = generateReplacerFromContext(context, rejectionReason)
    let body = replaceEmailTemplate(replacer,emailTemplate.body_template)
    let subject = replaceEmailTemplate(replacer,emailTemplate.subject_template)
    return {
        body,subject
    }
}

const generateReplacerFromContext = (context: OrderContext, rejectionReason?: string) => {
    let order = context.order
    let user = context.user
    let transaction = context.transaction ?? null

    //logging.log(`Encrypted Participant ID : ${encryptedParticipantId} , Participant ID: ${participant.id}`)
    let replacer : any = {
        NAMA_PENGGUNA: user.full_name,
        SUREL_PENGGUNA: user.email,
        ALAMAT_PENGGUNA: order.address_info,
        METODE_PENGIRIMAN: order.delivery_method
    }

    if(transaction) {
        replacer = {
            ...replacer,
            JUMLAH_YANG_DIBAYARKAN: transaction.amount,
            TAUTAN_PEMBAYARAN: transaction.snap_payment_url,
            MIDTRANS_ORDER_ID: transaction.midtrans_order_id,
            WAKTU_KADALUARSA_PEMBAYARAN: generateDateIndonesianString(transaction.should_expire_at) + ", pukul " + generateFormattedTime(moment(transaction.should_expire_at).utcOffset('+0700')) + " WIB"

        }
    }

    let rejectionString
    if(rejectionReason) {
        rejectionString = rejectionReason
    } else {
        if(transaction) {
            if(Date.now() > transaction.should_expire_at.getTime()) {
                rejectionString = "Pembayaran tidak diterima dalam waktu yang ditentukan"
            } else {
                rejectionString = ""
            }
        }
    }
    replacer.ALASAN_PENOLAKAN = rejectionString


    return replacer

}*/


