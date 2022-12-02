import { Express, Request, Response } from "express"
import * as fyers from "../../fyers"
import logger from "../../logger"
import { Session, User } from "../../model"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, (req: Request, res: Response) => {
        const cookie = req.cookies["fno.one"]
        if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
            Session.findOne({ session: cookie }).then(session => {
                if (session) {
                    const currentTimeUnixMs = Date.now()
                    if (session.expires < currentTimeUnixMs) {
                        res.clearCookie("fno.one")
                        return res.redirect("/error/sessionTimeout")
                    } else {

                        User.findOne({ _id: session.userId }).then(async user => {
                            if (user) {
                                const userProfile = await fyers.getProfile(user.fyAccessToken)
                                if (userProfile.code !== 200) {
                                    res.clearCookie("fno.one")
                                    return res.redirect("/error/sessionTimeout")
                                }
                                return res.send({ message: "Logged in", code: 200, data: { ...userProfile.data } })
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
        }
    })
}
