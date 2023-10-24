import { Express, Request, Response } from "express"
import logger from "../../../../logger"
import { Session, User } from "../../../../model"

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
									const positionTypeSettings = user.positionTypeSettings
									const moneyManager = user.moneyManager
									const longPositionSettings = req.body.positionTypeSettings.longPosition
									const scalpingPositionSettings = req.body.positionTypeSettings.scalpingPosition
									const swingPositionSettings = req.body.positionTypeSettings.swingPosition
									const expiryPositionSettings = req.body.positionTypeSettings.expiryPosition

									positionTypeSettings.longPosition.percentageOfFundsToUse = longPositionSettings.percentageOfFundsToUse || 0
									positionTypeSettings.longPosition.fundsToUse = longPositionSettings.fundsToUse || "0"
									positionTypeSettings.scalpingPosition.percentageOfFundsToUse = scalpingPositionSettings.percentageOfFundsToUse || 0
									positionTypeSettings.scalpingPosition.fundsToUse = scalpingPositionSettings.fundsToUse || "0"
									positionTypeSettings.swingPosition.percentageOfFundsToUse = swingPositionSettings.percentageOfFundsToUse || 0
									positionTypeSettings.swingPosition.fundsToUse = swingPositionSettings.fundsToUse || "0"
									positionTypeSettings.expiryPosition.percentageOfFundsToUse = expiryPositionSettings.percentageOfFundsToUse || 0
									positionTypeSettings.expiryPosition.fundsToUse = expiryPositionSettings.fundsToUse || "0"

									moneyManager.percentageOfFundsToUse = req.body.moneyManager.percentageOfFundsToUse || 0
									moneyManager.fundsToUse = req.body.moneyManager.fundsToUse || "0"
									user.positionTypeSettings = positionTypeSettings
									user.moneyManager = moneyManager

									user.save()
										.then(() => {
											return res.json({ message: "Success", code: 200 })
										})
										.catch((err) => {
											logger.error(err, "routes")
											return res.json({ message: "Error", code: 500 })
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
