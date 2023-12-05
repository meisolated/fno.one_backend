import { Express, Request, Response } from "express"
import logger from "../../../logger"
import { Session, Settings, User } from "../../../model"

export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path, "routes")
    app.post(path, (req: Request, res: Response) => {
        const cookie = req.cookies["fno.one"]
        if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
            Session.findOne({ session: cookie }).then((session) => {
                if (session) {
                    const currentTimeUnixMs = Date.now()
                    if (session.expires < currentTimeUnixMs) {
                        res.clearCookie("fno.one")
                        return res.redirect("/error/sessionTimeout")
                    } else {
                        User.findOne({ _id: session.userId }).then(async (user) => {
                            if (user) {
                                try {
                                    const developmentMode = req.body.developmentMode
                                    Settings.findOne({ id: 1 }).then((settings) => {
                                        if (settings) {
                                            settings.developmentMode = developmentMode
                                            settings.save().then(() => {
                                                return res.json({ message: "Success", code: 200 })
                                            })
                                        } else {
                                            return res.json({ message: "Error", code: 500 })
                                        }
                                    })
                                } catch (error: any) {
                                    logger.error(error, "routes")
                                    return res.json({ message: "Error", code: 500 })
                                }
                            } else {
                                res.clearCookie("fno.one")
                                return res.redirect("/error/userNotFound")
                            }
                        })
                    }
                } else {
                    res.clearCookie("fno.one")
                    return res.redirect("/error/sessionTimeout")
                }
            })
        } else {
            res.clearCookie("fno.one")
            return res.redirect("/error/sessionTimeout")
        }
    })
}
