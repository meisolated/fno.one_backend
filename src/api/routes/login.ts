import { Express, Request, Response } from "express"
import logger from "../../logger"
import { getConfigData } from "../../config/initialize"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        const cookie = req.cookies["fno.one"]
        const config = getConfigData()
        res.clearCookie("fno.one")
        const loginUrl = `https://api.fyers.in/api/v2/generate-authcode?client_id=${config.apis.fyers.appId}&redirect_uri=${config.apis.fyers.redirectUrl}&response_type=code&state=${config.apis.fyers.callbackSecret}`
        return res.redirect(loginUrl)
        // if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
        //     return res.redirect("/dashboard")
        // } else {
        //     // const config = await import("../../config/index.json")
        // }
    })
}
