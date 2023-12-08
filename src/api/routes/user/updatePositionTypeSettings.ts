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

									positionTypeSettings.long.percentageOfFundsToUse = longSettings.percentageOfFundsToUse || 0
									positionTypeSettings.long.preferredOptionPrice = longSettings.preferredOptionPrice || "ATM"
									positionTypeSettings.long.riskToRewardRatio = longSettings.riskToRewardRatio || 0
									positionTypeSettings.long.stopLoss = longSettings.stopLoss || 0

									positionTypeSettings.scalping.percentageOfFundsToUse = scalpingSettings.percentageOfFundsToUse || 0
									positionTypeSettings.scalping.preferredOptionPrice = scalpingSettings.preferredOptionPrice || "ATM"
									positionTypeSettings.scalping.riskToRewardRatio = scalpingSettings.riskToRewardRatio || 0
									positionTypeSettings.scalping.stopLoss = scalpingSettings.stopLoss || 0

									positionTypeSettings.swing.percentageOfFundsToUse = swingSettings.percentageOfFundsToUse || 0
									positionTypeSettings.swing.preferredOptionPrice = swingSettings.preferredOptionPrice || "ATM"
									positionTypeSettings.swing.riskToRewardRatio = swingSettings.riskToRewardRatio || 0
									positionTypeSettings.swing.stopLoss = swingSettings.stopLoss || 0

									positionTypeSettings.expiry.percentageOfFundsToUse = expirySettings.percentageOfFundsToUse || 0
									positionTypeSettings.expiry.preferredOptionPrice = expirySettings.preferredOptionPrice || "ATM"
									positionTypeSettings.expiry.riskToRewardRatio = expirySettings.riskToRewardRatio || 0
									positionTypeSettings.expiry.stopLoss = expirySettings.stopLoss || 0

									moneyManager.percentageOfFundsToUse = req.body.moneyManager.percentageOfFundsToUse || 0
									moneyManager.fundsToUse = req.body.moneyManager.fundsToUse || "0"
									moneyManager.mode = req.body.moneyManager.mode || "percentage"
									moneyManager.maxLossPerDay = req.body.moneyManager.maxLossPerDay || 0
									moneyManager.weekDays.monday = req.body.moneyManager.weekDays.monday || 0
									moneyManager.weekDays.tuesday = req.body.moneyManager.weekDays.tuesday || 0
									moneyManager.weekDays.wednesday = req.body.moneyManager.weekDays.wednesday || 0
									moneyManager.weekDays.thursday = req.body.moneyManager.weekDays.thursday || 0
									moneyManager.weekDays.friday = req.body.moneyManager.weekDays.friday || 0

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
