import { Express, Request, Response } from "express"
import { getMarketCurrentPrice } from "../../../helper"
import logger from "../../../logger"
import { Session, User } from "../../../model"

export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path, "routes")
    app.get(path, async (req: Request, res: Response) => {
        const cookie = req.query.cookie || req.cookies["fno.one"]
        if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
            const userId = await Session.findOne({ session: cookie })
            if (userId) {
                return res.json({ status: false, message: "This route is being developed." })
            }
        } else {
            return res.json({ message: "Invalid cookie", code: 401 })
        }
    })
}
