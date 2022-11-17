// res.cookie(name , 'value', {expire : new Date() + 9999});
// res.cookie(name, 'value', {maxAge : 9999});
// clearCookie('cookie_name'); // logout
import crypto from "crypto"
import { Express, Request, Response } from "express"
import logger from "../logger"
import * as fyers from "../fyers"
import { Session, User } from "../model"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        const cookie = req.cookies["fno.one"]
        if (req.headers.referer !== "https://api.fyers.in/") return res.redirect("https://api.fyers.in/")
        if (cookie) {
            //@ts-ignore
            const session = await Session.findOne({ session: cookie })
            if (session) {
                const user = await User.findOne({ _id: session.userId })
                if (user) {
                    const userProfile = await fyers.getProfile(user.fyAccessToken)
                    if (userProfile.code == 200) {
                        user.lastLogin = new Date()
                        await user.save()
                        return res.redirect("/dashboard")
                        // return res.send({ message: "Logged in", code: 200, data: { userProfile } })
                    } else {
                        res.clearCookie("fno.one")
                        return res.redirect("/error/sessionTimeout")
                        //return res.send({ message: "Maybe access token expired!", code: 401 })
                    }
                } else {
                    res.clearCookie("fno.one")
                    return res.redirect("/error/userNotFound")
                    //return res.send({ message: "User not found", code: 404 })
                }
            } else {
                res.clearCookie("fno.one")
                return res.redirect("/error/sessionTimeout")
                //return res.send({ message: "Session not found", code: 404 })
            }
        } else {
            if (req.query.auth_code || req.query.s == "ok") {
                const maxAge = 1000 * 60 * 60 * 24 * 30 // 30 days
                const currentTimeUnixMs = Date.now()
                const cookie = crypto.randomBytes(64).toString("hex")
                const cookieHash =
                    "fno.one-" +
                    crypto
                        .createHash("sha256")
                        .update(cookie + currentTimeUnixMs)
                        .digest("hex") +
                    "ily"
                res.cookie("fno.one", cookieHash, { maxAge })
                const accessToken = await fyers.generateAccessToken(req.query.auth_code)
                if (accessToken.code != 200) return res.send({ message: accessToken.message, code: accessToken.code })
                const userProfile = await fyers.getProfile(accessToken.access_token)
                if (userProfile.code != 200) return res.send({ message: userProfile.message, code: userProfile.code })
                let user = await User.findOne({ email: userProfile.data.email_id })
                if (user) {
                    user.fyAccessToken = accessToken.access_token
                    user.fyRefreshToken = accessToken.refresh_token
                    user.loggedIn = true
                    user.lastLogin = new Date()
                    await user.save()
                } else {
                    user = new User({
                        email: userProfile.data.email_id,
                        fyId: userProfile.data.fy_id,
                        fyAccessToken: accessToken.access_token,
                        fyRefreshToken: accessToken.refresh_token,
                        name: userProfile.data.name,
                        image: userProfile.data.image,
                        status: "1",
                        displayName: userProfile.data.display_name,
                        loggedIn: true,
                        lastLogin: new Date(),
                    })
                    await user.save()
                }
                const session = new Session({
                    session: cookieHash,
                    expires: new Date(currentTimeUnixMs + maxAge),
                    userId: user._id,
                })
                await session.save()
                return res.redirect("/dashboard")
                //res.send({ message: "Login Successful", code: 200, cookie: cookieHash, maxAge })
            } else {
                return res.redirect("/error/invalidRequest")
                //res.send({ message: "Login Failed " + _req.query.message, code: 500 })
            }
        }
    })
}
