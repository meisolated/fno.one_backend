import moment from "moment"
import { HistoricalData } from "../model"

const getLast12MonthsUnixTimestamps = () => {
	const twelveMonthsUnix = moment().subtract(12, "months").unix()
	const now = moment().unix()
	return { twelveMonthsUnix, now }
}

const scalpingStrategyBacktest = async () => {
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
		let winningTrades = 0
		let losingTrades = 0

		for (let i = 1; i < candleData.length; i++) {
			const currentCandle = candleData[i]
			const previousCandle = candleData[i - 1]

			// Scalping trade for 20 to 30 points
			const tradeProfit = currentCandle.c - previousCandle.c

			if (tradeProfit > 0 && tradeProfit >= 20 && tradeProfit <= 30) {
				totalProfit += tradeProfit
				winningTrades++
			} else if (tradeProfit < 0 && Math.abs(tradeProfit) >= 20 && Math.abs(tradeProfit) <= 30) {
				totalLoss += Math.abs(tradeProfit)
				losingTrades++
			}
		}

		console.log("Scalping Strategy Results:")
		console.log("Winning Trades:", winningTrades)
		console.log("Losing Trades:", losingTrades)
		console.log("Total Profit (Points):", totalProfit)
		console.log("Total Loss (Points):", totalLoss)
	} catch (err) {
		console.error("Error during backtest:", err)
	} finally {
		console.log("Scalping strategy backtest completed")
	}
}

scalpingStrategyBacktest()
