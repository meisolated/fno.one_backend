import { Express, Request, Response } from "express"
import logger from "../../logger"
import { Session, User } from "../../model"

export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.get(path, async (req: Request, res: Response) => {
		const cookie = req.query.cookie || req.cookies["fno.one"]
		if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
			const userId = await Session.findOne({ session: cookie })
			if (userId) {
				const user = await User.findOne({ _id: userId.userId })
				if (user) {
					const data = {
						positionTypes: [
							{
								id: "long",
								name: "Long",
								description: "Place a limit order to buy the option at the limit price or lower and very lenient stop loss",
								maxRiskToRewardRatio: 5,
								minRiskToRewardRatio: 2,
								trailing: {
									enable: true,
									after: 2,
									percentage: 0.5,
									percentageType: "soft",
								},
							},
							{
								id: "scalping",
								name: "Scalping",
								description: "Place a limit order to buy the option at the limit price or lower and very strict stop loss",
								maxRiskToRewardRatio: 1.5,
								minRiskToRewardRatio: 1,
								trailing: {
									enable: true,
									after: 0.5,
									percentage: 0.5,
									percentageType: "hard",
								},
							},
							{
								id: "swing",
								name: "Swing",
								description: "Place a limit order to buy the option at the limit price or lower and strict stop loss",
								maxRiskToRewardRatio: 2,
								minRiskToRewardRatio: 1.5,
								trailing: {
									enable: true,
									after: 1,
									percentage: 0.5,
									percentageType: "soft",
								},
							},
							{
								id: "expiry",
								name: "Expiry",
								description: "Place 2 orders on each side of the option chain like a straddle and wait for the market to move in one direction",
								maxRiskToRewardRatio: 10,
								minRiskToRewardRatio: 2,
								trailing: {
									enable: false,
									after: 0.5,
									percentage: 0.5,
									percentageType: "veryHard",
								},
							},
						],
						optionSelectionTypes: ["ATM", "NAP", "ITM", "OTM"],
					}

					return res.json({ message: "Success", code: 200, data: data })
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
	app.get(path, (req: Request, res: Response) => {})
}
