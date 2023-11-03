import nodemailer from "nodemailer"
import { getConfigData } from "../../config/initialize"

export async function sendMail(to: string, subject: string, text?: string, html?: string) {
	const config = getConfigData()
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
		from: {
			name: "Vedus",
			address: config.serverConf.SMTP.auth.user,
		},
		to: to,
		subject: subject,
		envelope: {
			from: `FnO<${config.serverConf.SMTP.auth.user}>`, // used as MAIL FROM: address for SMTP
			to: to, // used as RCPT TO: address for SMTP
		},
		text: text,
		html: html || text,
	}
	mailer.sendMail(message, function (err: any, info: any) {
		if (err) {
			console.log(err)
		} else {
			console.log(info)
		}
	})
}
