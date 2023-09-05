import { Express, Request, Response } from "express"
import { Logger, Session, User } from "../../model"

import HistoricalData from "../../lib/trueData/historical"
import logger from "../../logger"
import { baseSymbolsList } from "../../provider/symbols.provider"

export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.get(path, async (req: Request, res: Response) => {
		const cookie = req.query.cookie || req.cookies["fno.one"]
		if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
			const userId = await Session.findOne({ session: cookie })
			if (userId) {
				const user = await User.findOne({ _id: userId.userId })
				if (user) {
					// if (user.roles.includes("admin")) {

					// }
					const symbols = await baseSymbolsList()
					const historical = new HistoricalData()
					await historical.getAccessToken()
					if (!historical._accessTokenGenerated) logger.error("Access token not generated")

					const data = await historical.getLastNBars(symbols, 1, "1min", 0)
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
