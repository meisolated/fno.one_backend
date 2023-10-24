import { Express, Request, Response } from "express"
import { getFunds } from "../../lib/fyers"
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
					const userFyersFunds = await getFunds(user.userAppsData.fyers.accessToken)
					user.funds.fyers.total = userFyersFunds.fund_limit.filter((fund: any) => fund.id === 1)[0].equityAmount
					user.funds.fyers.available = userFyersFunds.fund_limit.filter((fund: any) => fund.id === 10)[0].equityAmount
					user.funds.fyers.used = userFyersFunds.fund_limit.filter((fund: any) => fund.id === 2)[0].equityAmount
					await user.save()
					return res.json({ message: "User funds", code: 200, data: userFyersFunds })
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
