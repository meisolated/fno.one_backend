import { Express, Request, Response } from "express"
import { Session, User } from "../../model"

import { placeSingleOrder } from "../../lib/fyers"
import logger from "../../logger"

export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.post(path, async (req: Request, res: Response) => {
		const cookie = req.query.cookie || req.cookies["fno.one"]
		if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
			const userId = await Session.findOne({ session: cookie })
			if (userId) {
				const user = await User.findOne({ _id: userId.userId })
				if (user) {
					if (user.roles.includes("admin")) {
						const data: any = req.body
						const placeOrderResponse = await placeSingleOrder(user.userAppsData.fyers.accessToken, {
							symbol: data.symbol,
							qty: data.qty,
							type: data.type,
							side: data.side,
							productType: data.productType,
							limitPrice: data.limitPrice,
							stopPrice: data.stopPrice,
							disclosedQty: data.disclosedQty,
							validity: data.validity,
							offlineOrder: data.offlineOrder,
							stopLoss: data.stopLoss,
							takeProfit: data.takeProfit,
						})
						return res.json(placeOrderResponse)
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
