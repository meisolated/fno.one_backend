import { Express, Request, Response } from "express"
import serverData from "../../../config/serverData"
import logger from "../../../logger"
import { Session, User } from "../../../model"
import { isTodayHoliday, isTomorrowHoliday } from "../../../provider/marketData.provider"
export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.get(path, (req: Request, res: Response) => {
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
								const userRawData = {
									_id: user._id,
									email: user.email,
									roles: user.roles,
									status: user.status,
									image: user.image,
									displayName: user.displayName,
									apps: user.apps,
									loggedIn: user.loggedIn,
									lastLogin: user.lastLogin,
									funds: user.funds,
									positionTypeSettings: user.positionTypeSettings,
									moneyManager: user.moneyManager,
								}
								const todayHoliday = await isTodayHoliday()
								const tomorrowHoliday = await isTomorrowHoliday()
								return res.send({ message: "Logged in", code: 200, data: { ...userRawData, serverData, todayHoliday, tomorrowHoliday } })
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
