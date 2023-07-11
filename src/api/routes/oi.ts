import { Express, Request, Response } from "express"
import { getMarketCurrentPrice } from "../../helper"
import logger from "../../logger"
import { Session, User } from "../../model"

export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        const cookie = req.query.cookie || req.cookies["fno.one"]
        if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
            const userId = await Session.findOne({ session: cookie })
            const market: string = String(req.query.market) || "NSE:NIFTYBANK-INDEX"
            if (userId) {
                const marketCurrentPrice = await getMarketCurrentPrice(market)
                return res.json({ marketCurrentPrice })
            }
        } else {
            return res.json({ message: "Invalid cookie", code: 401 })
        }
    })
}
