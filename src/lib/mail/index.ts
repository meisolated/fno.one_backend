//@ts-ignore
import nodemailer from "nodemailer"
import { getConfigData } from "../../config/initialize"
const config = getConfigData()

const template = ``

function main() {
    const mailer = nodemailer.createTransport({
        host: config.serverConf.SMTP.host,
        port: config.serverConf.SMTP.port,
        secure: config.serverConf.SMTP.secure,
        auth: {
            user: config.serverConf.SMTP.auth.user,
            pass: config.serverConf.SMTP.auth.pass,
        },
    })

    var message = {
        from: config.serverConf.SMTP.auth.user,
        to: "isolatedbot@gmail.com",
        subject: "Message title",
        envelope: {
            from: `Vivek Mudgal <${config.serverConf.SMTP.auth.user}>`, // used as MAIL FROM: address for SMTP
            to: "isolatedbot@gmail.com", // used as RCPT TO: address for SMTP
        },
        text: "Plaintext version of the message",
        html: template,
    }
    mailer.sendMail(message, function (err: any, info: any) {
        if (err) {
            console.log(err)
        } else {
            console.log(info)
        }
    })
}


export const sendTestMail = () => {
    main()
}
