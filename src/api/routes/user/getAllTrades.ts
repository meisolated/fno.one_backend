import { Express, Request, Response } from "express"
import logger from "../../../logger"
import { Positions, Session, User } from "../../../model"

export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path, "routes")
    app.get(path, async (req: Request, res: Response) => {
        const cookie = req.query.cookie || req.cookies["fno.one"]
        if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
            const userId = await Session.findOne({ session: cookie })
            if (userId) {
                const user = await User.findOne({ _id: userId.userId })
                if (user) {

                    return res.json({ message: "End point not complete", code: 200, data: [] })
                } else {
                    return res.json({ message: "User not found", code: 404 })
                }
            } else {
                return res.json({ message: "Session not found", code: 404 })
            }
        } else {
            return res.json({ message: "Invalid cookie", code: 401 })
        }
    })
}

