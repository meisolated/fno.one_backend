import crypto from "crypto"
import { Express, Request, Response } from "express"
import * as fyers from "../../lib/broker/fyers"
import logger from "../../logger"
import { Session, User } from "../../model"
export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.get(path, async (req: Request, res: Response) => {
		const cookie = req.cookies["fno.one"]
		if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
			const session = await Session.findOne({ session: cookie })
			if (session) {
				const user = await User.findOne({ _id: session.userId })
				if (user) {
					const userProfile = await fyers.getProfile(user.userAppsData.fyers.accessToken)
					if (userProfile.code == 200) {
						user.lastLogin = new Date()
						if (user.connectedApps.includes("fyers") == false) user.connectedApps.push("fyers")
						await user.save()
						return res.redirect("/dashboard") // return res.send({ message: "Logged in", code: 200, data: { userProfile } })
					} else {
						res.clearCookie("fno.one")
						return res.redirect("/error/sessionTimeout") //return res.send({ message: "Maybe access token expired!", code: 401 })
					}
				} else {
					res.clearCookie("fno.one")
					return res.redirect("/error/userNotFound") //return res.send({ message: "User not found", code: 404 })
				}
			} else {
				res.clearCookie("fno.one")
				return res.redirect("/error/sessionTimeout") //return res.send({ message: "Session not found", code: 404 })
			}
		} else {
			if (req.headers.referer !== "https://api-t1.fyers.in/") return res.redirect("/error/invalidRequest")
			if (req.query.auth_code || req.query.s == "ok") {
				const maxAge = 1000 * 60 * 60 * 12 // 12 hours
				const currentTimeUnixMs = Date.now()
				const cookie = crypto.randomBytes(64).toString("hex")
				const cookieHash = `fno.one-${crypto
					.createHash("sha256")
					.update(cookie + currentTimeUnixMs)
					.digest("hex")}-ily-ASZ`
				res.cookie("fno.one", cookieHash, { maxAge })
				const accessToken = await fyers.generateAccessToken(req.query.auth_code)
				if (accessToken.code != 200) return res.send({ message: accessToken.message, code: accessToken.code })
				const userProfile = await fyers.getProfile(accessToken.access_token)
				if (userProfile.code != 200) return res.send({ message: userProfile.message, code: userProfile.code })
				let user = await User.findOne({ email: userProfile.data.email_id })
				if (user) {
					user.userAppsData.fyers.accessToken = accessToken.access_token
					user.userAppsData.fyers.refreshToken = accessToken.refresh_token
					user.loggedIn = true
					user.pan = userProfile.data.pan
					user.image = userProfile.data.image
					user.lastLogin = new Date()
					if (user.connectedApps.includes("fyers") == false) user.connectedApps.push("fyers")
					await user.save()
				} else {
					user = new User({
						email: userProfile.data.email_id,
						pan: userProfile.data.pan,
						userAppsData: {
							fyers: {
								accessToken: accessToken.access_token,
								refreshToken: accessToken.refresh_token,
								Id: userProfile.data.fy_id,
							},
						},
						name: userProfile.data.name,
						image: userProfile.data.image,
						status: "1",
						displayName: userProfile.data.display_name,
						loggedIn: true,
						connectedApps: ["fyers"],
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
				return res.redirect("/dashboard") //res.send({ message: "Login Successful", code: 200, cookie: cookieHash, maxAge })
			} else {
				return res.redirect("/error/invalidRequest") //res.send({ message: "Login Failed " + _req.query.message, code: 500 })
			}
		}
	})
}
