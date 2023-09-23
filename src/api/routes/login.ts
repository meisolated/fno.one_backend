import { Express, Request, Response } from "express"
import { getConfigData } from "../../config/initialize"
import logger from "../../logger"
export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.get(path, async (req: Request, res: Response) => {
		const cookie = req.cookies["fno.one"]
		const config = getConfigData()
		res.clearCookie("fno.one")
		const loginUrl = `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${config.apis.fyers.appId}&redirect_uri=${config.apis.fyers.redirectUrl}&response_type=code&state=${config.apis.fyers.callbackSecret}`
		return res.redirect(loginUrl)
		// if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
		//     return res.redirect("/dashboard")
		// } else {
		//     // const config = await import("../../config/index.json")
		// }
	})
}
