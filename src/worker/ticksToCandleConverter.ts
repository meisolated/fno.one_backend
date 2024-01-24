import cron from "node-cron"
import chatter from "../events"
import logger from "../logger"
import { isMarketOpen } from "../provider/marketData.provider"
import { isHammer, isInvertedHammer } from "../tradeFinder/candleStickIdentifier"

interface iMarketData {
	[symbol: string]: iSymbolTicks
}
var candle1Minute: any = {}
var candle5Minute: any = {}
var candle15Minute: any = {}
var marketData: iMarketData = {}

export default async function () {
	logger.info("Starting ticks to candle converter...", "TicksToCandleConverter")

	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		marketData[symbolData.symbol] = symbolData
		if (candle1Minute[symbolData.symbol]) {
			if (candle1Minute[symbolData.symbol].high < symbolData.lp || candle1Minute[symbolData.symbol].high == 0) {
				candle1Minute[symbolData.symbol].high = symbolData.lp
			}
			if (candle1Minute[symbolData.symbol].low > symbolData.lp || candle1Minute[symbolData.symbol].low == 0) {
				candle1Minute[symbolData.symbol].low = symbolData.lp
			}
		}
		if (candle5Minute[symbolData.symbol]) {
			if (candle5Minute[symbolData.symbol].high < symbolData.lp || candle5Minute[symbolData.symbol].high == 0) {
				candle5Minute[symbolData.symbol].high = symbolData.lp
			}
			if (candle5Minute[symbolData.symbol].low > symbolData.lp || candle5Minute[symbolData.symbol].low == 0) {
				candle5Minute[symbolData.symbol].low = symbolData.lp
			}
		}
	})
	// Every 1 minute
	const jobEvery1Minute = cron.schedule("* * * * *", async () => {
		// current time hour and minute
		const now = new Date()
		const hour = now.getHours()
		const minute = now.getMinutes() - 1
		const second = now.getSeconds()
		const isMarketOpenNow = await isMarketOpen()
		if (!isMarketOpenNow) return
		// console.log(hour, ":", minute, ":", second)
		for (const symbol in marketData) {
			if (candle1Minute[symbol]) {
				candle1Minute[symbol].close = marketData[symbol].lp
				chatter.emit("candleStickUpdate-", "1min", { ...candle1Minute[symbol], symbol })
				if (symbol == "NIFTY BANK") {
					// console.log(candle1Minute[symbol], "1min")
					// console.log("isHammer", isHammer(candle1Minute[symbol]))
					// console.log("isInvertedHammer", isInvertedHammer(candle1Minute[symbol]))
				}
				// remove the 1 minute candle
				candle1Minute[symbol] = {
					open: marketData[symbol].lp,
					close: 0,
					high: 0,
					low: 0,
				}
			} else {
				candle1Minute[symbol] = {
					open: marketData[symbol].lp,
					close: 0,
					high: 0,
					low: 0,
				}
			}
		}
	})
	// Every 5 minutes
	const jobEvery5Minutes = cron.schedule("*/5 * * * *", async () => {
		// current time hour and minute
		const now = new Date()
		const hour = now.getHours()
		const minute = now.getMinutes() - 5
		const second = now.getSeconds()
		const isMarketOpenNow = await isMarketOpen()
		if (!isMarketOpenNow) return
		// console.log(hour, ":", minute, ":", second)
		for (const symbol in marketData) {
			if (candle5Minute[symbol]) {
				candle5Minute[symbol].close = marketData[symbol].lp
				chatter.emit("candleStickUpdate-", "5min", { ...candle5Minute[symbol], symbol })
				if (symbol == "NIFTY BANK") {
					// console.log(candle5Minute[symbol], "5min")
					// console.log("isHammer", isHammer(candle5Minute[symbol]))
					// console.log("isInvertedHammer", isInvertedHammer(candle5Minute[symbol]))
				}
				// remove the 5 minute candle
				candle5Minute[symbol] = {
					open: marketData[symbol].lp,
					close: 0,
					high: 0,
					low: 0,
				}
			} else {
				candle5Minute[symbol] = {
					open: marketData[symbol].lp,
					close: 0,
					high: 0,
					low: 0,
				}
			}
		}
	})

	const jobEvery15Minutes = cron.schedule("*/15 * * * *", async () => {
		// current time hour and minute
		const now = new Date()
		const hour = now.getHours()
		const minute = now.getMinutes() - 15
		const second = now.getSeconds()
		const isMarketOpenNow = await isMarketOpen()
		if (!isMarketOpenNow) return
		// console.log(hour, ":", minute, ":", second)
		for (const symbol in marketData) {
			if (candle15Minute[symbol]) {
				candle15Minute[symbol].close = marketData[symbol].lp
				chatter.emit("candleStickUpdate-", "15min", { ...candle15Minute[symbol], symbol })
				if (symbol == "NIFTY BANK") {
					// console.log(candle15Minute[symbol], "15min")
					// console.log("isHammer", isHammer(candle15Minute[symbol]))
					// console.log("isInvertedHammer", isInvertedHammer(candle15Minute[symbol]))
				}
				// remove the 15 minute candle
				candle15Minute[symbol] = {
					open: marketData[symbol].lp,
					close: 0,
					high: 0,
					low: 0,
				}
			} else {
				candle15Minute[symbol] = {
					open: marketData[symbol].lp,
					close: 0,
					high: 0,
					low: 0,
				}
			}
		}
	})

	// Start the cron jobs
	jobEvery1Minute.start()
	jobEvery5Minutes.start()
}
