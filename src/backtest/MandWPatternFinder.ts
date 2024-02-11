import moment from "moment"
import { HistoricalData } from "../model"

interface candle {
	h: number
	l: number
	o: number
	c: number
	t: number
}

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
			resolution: "5",
			t: { $gte: twelveMonthsUnix, $lte: now },
		}).lean()

		if (candleData.length === 0) return console.log("No data found")

		let patterns: string[] = []


		for (let i = 0; i < candleData.length; i++) {
			const currentCandle: candle = candleData[i]
			const getHoursInIST = new Date(currentCandle.t * 1000).getHours()
			const getMinutesInIST = new Date(currentCandle.t * 1000).getMinutes()
			const day = new Date(currentCandle.t * 1000).getDay()



			if (candleData.length - 1 === i) {
			}
		}
	} catch (err) {
		console.error("Error during backtest:", err)
	} finally {
		console.log("Backtest completed")
	}
}

breakoutStrategyBacktest()
