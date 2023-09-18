import crypto from "crypto"
import { Express, Request, Response } from "express"
import { getConfigData } from "../../config/initialize"
import logger from "../../logger"
export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	const config = getConfigData()
	app.post(path, (req: Request, res: Response) => {
		const receivedSignature = req.headers["x-signature"] // FYERS might send the signature in a custom header
		console.log(req.headers)
		// Verify the signature
		// const calculatedSignature = crypto
		//     .createHmac('sha256', config.apis.fyers.webhookSecret)
		//     .update(JSON.stringify(req.body))
		//     .digest('hex')
		// console.log(receivedSignature, calculatedSignature)
		if (receivedSignature === config.apis.fyers.webhookSecret) {
			// The signature is valid, process the webhook data
			const webhookData = req.body
			console.log("Received webhook data:", webhookData)

			// Add your logic to process the webhook data here

			res.status(200).send("Webhook received and verified successfully")
		} else {
			// Invalid signature, reject the request
			res.status(401).send("Invalid signature")
		}
	})
}
