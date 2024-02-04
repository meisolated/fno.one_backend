import moment from "moment"
import { HistoricalData } from "../model"

const getLast12MonthsUnixTimestamps = () => {
	const twelveMonthsUnix = moment().subtract(12, "months").unix()
	const now = moment().unix()
	return { twelveMonthsUnix, now }
}
const breakoutStrategyBacktest = async () => {
	try {
		const { twelveMonthsUnix, now } = getLast12MonthsUnixTimestamps()
		const candleData = await HistoricalData.find({ symbol: "NSE:NIFTYBANK-INDEX", resolution: "1", t: { $gte: twelveMonthsUnix, $lte: now } }).lean()
		if (candleData.length === 0) return console.log("No data found")
		let totalProfit = 0
		let totalLoss = 0
		let profitableDays = 0
		let lossDays = 0
		let highestProfit = 0
		let currentTrade: { entryPrice: number; stopLoss: number } | null = null

		for (let i = 0; i < candleData.length; i++) {
			const currentCandle = candleData[i]
			const getHoursInIST = new Date(currentCandle.t * 1000).getHours()
			const getMinutesInIST = new Date(currentCandle.t * 1000).getMinutes()
			if (currentCandle.t == 1698810300) console.log(getHoursInIST, getMinutesInIST)
			if (getHoursInIST === 9 && getMinutesInIST === 20) {
				// Market opens, initialize trade
				currentTrade = {
					entryPrice: currentCandle.o,
					stopLoss: currentCandle.o - 100,
				}
			} else if (currentTrade) {
				// Check for breakout
				const breakoutUp = currentCandle.h > currentTrade.entryPrice
				const breakoutDown = currentCandle.l < currentTrade.entryPrice

				if (breakoutUp || breakoutDown) {
					const profitOrLoss = breakoutUp ? currentCandle.h - currentTrade.entryPrice : currentTrade.entryPrice - currentCandle.l

					if (profitOrLoss > 0) {
						totalProfit += profitOrLoss
						profitableDays++
						if (profitOrLoss > highestProfit) {
							highestProfit = profitOrLoss
						}
					} else {
						totalLoss += Math.abs(profitOrLoss)
						lossDays++
					}

					currentTrade = null // Reset trade
				}
			}
		}

		const averageProfit = profitableDays > 0 ? totalProfit / profitableDays : 0

		console.log("Backtest Results:")
		console.log("Profitable Days:", profitableDays)
		console.log("Loss Days:", lossDays)
		console.log("Highest Profit:", highestProfit)
		console.log("Average Profit:", averageProfit)
	} catch (err) {
		console.error("Error during backtest:", err)
	} finally {
		console.log("Backtest completed")
		// return process.exit(0)
	}
}

breakoutStrategyBacktest()
