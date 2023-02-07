import { Express, Request, Response } from "express"
import logger from "../../logger"
import config from "../../config"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        const cookie = req.cookies["fno.one"]
        if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
            res.clearCookie("fno.one")
            return res.redirect("/dashboard")
        } else {
            // const config = await import("../../config/index.json")
            const loginUrl = `https://api.fyers.in/api/v2/generate-authcode?client_id=${config.fyers.appId}&redirect_uri=${config.fyers.redirectUrl}&response_type=code&state=${config.fyers.callbackSecret}`
            return res.redirect(loginUrl)
        }
    })
}
