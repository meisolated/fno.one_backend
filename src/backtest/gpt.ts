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
		const candleData = await HistoricalData.find({
			symbol: "NSE:NIFTYBANK-INDEX",
			resolution: "1",
			t: { $gte: twelveMonthsUnix, $lte: now },
		}).lean()

		if (candleData.length === 0) return console.log("No data found")

		let totalProfit = 0
		let totalLoss = 0
		let totalProfitInPoints = 0
		let totalLossInPoints = 0
		let profitableDays = 0
		let lossDays = 0
		let highestProfit = 0
		let currentTrade: { entryCandle: any; stopLoss: number } | null = null

		// Adjust these parameters
		const breakoutRange = 100 // Experiment with different values
		const stopLossLevel = 100 // Experiment with different values

		for (let i = 0; i < candleData.length; i++) {
			const currentCandle = candleData[i]
			const getHoursInIST = new Date(currentCandle.t * 1000).getHours()
			const getMinutesInIST = new Date(currentCandle.t * 1000).getMinutes()

			if (getHoursInIST === 9 && getMinutesInIST === 15) {
				// Market opens, initialize trade

				currentTrade = {
					entryCandle: currentCandle,
					stopLoss: currentCandle.o - stopLossLevel,
				}
			} else if (currentTrade) {
				// Check for breakout
				const breakoutUp = currentCandle.h > currentTrade.entryCandle.h + breakoutRange
				const breakoutDown = currentCandle.l < currentTrade.entryCandle.l - breakoutRange

				if (breakoutUp || breakoutDown) {
					const exitPrice = breakoutUp ? currentCandle.h : currentCandle.l
					const profitOrLoss = exitPrice - currentTrade.entryCandle.o

					if (profitOrLoss > 0) {
						totalProfit += profitOrLoss
						totalProfitInPoints += profitOrLoss
						profitableDays++
						if (profitOrLoss > highestProfit) {
							highestProfit = profitOrLoss
						}
					} else {
						totalLoss += Math.abs(profitOrLoss)
						totalLossInPoints += Math.abs(profitOrLoss)
						lossDays++
					}

					currentTrade = null // Reset trade
				} else if (currentCandle.h > currentTrade.stopLoss || currentCandle.l < currentTrade.stopLoss) {
					// Hit stop loss, wait for entry on the other side
					currentTrade = {
						entryCandle: currentCandle,
						stopLoss: currentCandle.o - stopLossLevel,
					}
				}
			}
		}

		const averageProfit = profitableDays > 0 ? totalProfit / profitableDays : 0

		console.log("Backtest Results:")
		console.log("Profitable Days:", profitableDays)
		console.log("Loss Days:", lossDays)
		console.log("Highest Profit:", highestProfit)
		console.log("Average Profit:", averageProfit)
		console.log("Total Profit (Points):", totalProfitInPoints)
		console.log("Total Loss (Points):", totalLossInPoints)
	} catch (err) {
		console.error("Error during backtest:", err)
	} finally {
		console.log("Backtest completed")
	}
}

breakoutStrategyBacktest()
