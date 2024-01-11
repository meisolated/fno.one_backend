import { Express, Request, Response } from "express"
import logger from "../../../logger"
import { beforePositionOrderFilledStatuses, closedPositionStatuses, inPositionStatues } from "../../../manager/derivativePositionManager/position.manager"
import { Positions, Session, User } from "../../../model"
import { _fyersSymbolToTrueDataSymbol } from "../../../provider/symbols.provider"

export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.get(path, async (req: Request, res: Response) => {
		const cookie = req.query.cookie || req.cookies["fno.one"]
		if (cookie && cookie.includes("ily") && cookie.includes("fno.one-")) {
			const userId = await Session.findOne({ session: cookie })
			if (userId) {
				const user = await User.findOne({ _id: userId.userId })
				if (user) {
					const positions = await getUserPositionsOfTheDay(user._id.toString())
					const positionMetrics = calculatePositionsMetrics(positions)
					return res.json({ message: "User positions", code: 200, data: { positions, positionMetrics } })
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
async function getUserPositionsOfTheDay(id: string) {
	const today = new Date()
	const options = { timeZone: "Asia/Kolkata" }
	const startTime = new Date(today.setHours(9, 15, 0, 0)).toLocaleString("en-US", options)
	const endTime = new Date(today.setHours(18, 30, 0, 0)).toLocaleString("en-US", options)
	const positions = await Positions.find({
		status: { $in: [...inPositionStatues, ...closedPositionStatuses, ...beforePositionOrderFilledStatuses] },
		paper: false,
		userId: id,
		createdAt: {
			$gte: new Date(startTime).getTime(),
			$lt: new Date(endTime).getTime(),
		},
	})
	const modifiedPositions = positions.map((position) => {
		return {
			...position.toObject(),
			trueDataSymbol: _fyersSymbolToTrueDataSymbol[position.symbol],
		}
	})
	return modifiedPositions
}
function calculatePositionsMetrics(positions: any) {
	let totalPointsCaptured = 0
	let totalProfitAndLoss = 0
	positions.map((position: any) => {
		if (position.side == 1) {
			totalProfitAndLoss += (position.sellAveragePrice - position.buyAveragePrice) * position.quantity
			totalPointsCaptured += position.sellAveragePrice - position.buyAveragePrice
		} else {
			totalProfitAndLoss += (position.buyAveragePrice - position.sellAveragePrice) * position.quantity
			totalPointsCaptured += position.buyAveragePrice - position.sellAveragePrice
		}
	})
	return { totalPointsCaptured: parseFloat(totalPointsCaptured.toFixed(2)), totalProfitAndLoss: parseFloat(totalProfitAndLoss.toFixed(2)) }
}

