import { Express, Request, Response } from "express"
import { getOrders } from "../../lib/broker/fyers"
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
					const trades = await getOrders(user.userAppsData.fyers.accessToken)
					if (trades.code == 200) {
						return res.send({ message: "Success", code: 200, orders: trades.orderBook })
					} else {
						return res.send({ message: trades.message, code: trades.code })
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
