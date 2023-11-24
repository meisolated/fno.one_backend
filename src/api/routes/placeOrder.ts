import { Express, Request, Response } from "express"
import { tradesChatterInstance } from "../../events"
import logger from "../../logger"
import { Session, User } from "../../model"

export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.post(path, async (req: Request, res: Response) => {
		const cookie = req.query.cookie || req.cookies["fno.one"]
		if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
			const userId = await Session.findOne({ session: cookie })
			if (userId) {
				const user = await User.findOne({ _id: userId.userId })
				if (user) {
					const data = req.body
					const symbol = data.symbol
					const quantity = data.quantity
					const riskToReward = data.riskToReward
					const positionType = data.positionType
					const stopLoss = data.stopLoss
					const orderSide = data.orderSide
					const newTradeDetails: iNewTradeDetails = { ...data, userId: user._id }
					if (!symbol || !quantity || !riskToReward || !positionType || !stopLoss || !orderSide) {
						console.log(data)
						return res.json({ message: "Invalid request", code: 400 })
					} else {
						tradesChatterInstance.emit("tradeManager-", "newTradeDetails", newTradeDetails)
						return res.json({ message: "Order placed", code: 200 })
					}
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
