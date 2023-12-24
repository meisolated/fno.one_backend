import { Express, Request, Response } from "express"
import logger from "../../../logger"
import { Session, User } from "../../../model"

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
									const longSettings = req.body.positionTypeSettings.long
									const scalpingSettings = req.body.positionTypeSettings.scalping
									const swingSettings = req.body.positionTypeSettings.swing
									const expirySettings = req.body.positionTypeSettings.expiry

									positionTypeSettings.long.preferredOptionPrice = longSettings.preferredOptionPrice || "ATM"
									positionTypeSettings.long.riskToRewardRatio = longSettings.riskToRewardRatio || 0
									positionTypeSettings.long.stopLoss = longSettings.stopLoss || 0
									positionTypeSettings.long.quantity = longSettings.quantity || 0

									positionTypeSettings.scalping.preferredOptionPrice = scalpingSettings.preferredOptionPrice || "ATM"
									positionTypeSettings.scalping.riskToRewardRatio = scalpingSettings.riskToRewardRatio || 0
									positionTypeSettings.scalping.stopLoss = scalpingSettings.stopLoss || 0
									positionTypeSettings.scalping.quantity = scalpingSettings.quantity || 0

									positionTypeSettings.swing.preferredOptionPrice = swingSettings.preferredOptionPrice || "ATM"
									positionTypeSettings.swing.riskToRewardRatio = swingSettings.riskToRewardRatio || 0
									positionTypeSettings.swing.stopLoss = swingSettings.stopLoss || 0
									positionTypeSettings.swing.quantity = swingSettings.quantity || 0

									positionTypeSettings.expiry.preferredOptionPrice = expirySettings.preferredOptionPrice || "ATM"
									positionTypeSettings.expiry.riskToRewardRatio = expirySettings.riskToRewardRatio || 0
									positionTypeSettings.expiry.stopLoss = expirySettings.stopLoss || 0
									positionTypeSettings.expiry.quantity = expirySettings.quantity || 0

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
