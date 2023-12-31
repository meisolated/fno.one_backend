import cron from "node-cron"
import chatter from "../events"
import logger from "../logger"
import { isMarketOpen } from "../provider/marketData.provider"

interface iMarketData {
	[symbol: string]: iSymbolTicks
}
var candle1Minute: any = {}
var candle5Minute: any = {}
var marketData: iMarketData = {}

export default async function () {
	logger.info("Starting ticks to candle converter...", "TicksToCandleConverter")

	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		marketData[symbolData.symbol] = symbolData
		if (candle1Minute[symbolData.symbol]) {
			if (candle1Minute[symbolData.symbol].high < symbolData.lp) {
				candle1Minute[symbolData.symbol].high = symbolData.lp
			}
			if (candle1Minute[symbolData.symbol].low > symbolData.lp) {
				candle1Minute[symbolData.symbol].low = symbolData.lp
			}
		}
		if (candle5Minute[symbolData.symbol]) {
			if (candle5Minute[symbolData.symbol].high < symbolData.lp) {
				candle5Minute[symbolData.symbol].high = symbolData.lp
			}
			if (candle5Minute[symbolData.symbol].low > symbolData.lp) {
				candle5Minute[symbolData.symbol].low = symbolData.lp
			}
		}
	})
	// Every 1 minute
	const jobEvery1Minute = cron.schedule("* * * * *", async () => {
		const isMarketOpenNow = await isMarketOpen()
		if (!isMarketOpenNow) return
		for (const symbol in marketData) {
			if (candle1Minute[symbol]) {
				candle1Minute[symbol].close = marketData[symbol].lp
				chatter.emit("candleStickUpdate-", "1min", candle1Minute[symbol])
				candle1Minute[symbol] = null
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
		const isMarketOpenNow = await isMarketOpen()
		if (!isMarketOpenNow) return

		for (const symbol in marketData) {
			if (candle5Minute[symbol]) {
				candle5Minute[symbol].close = marketData[symbol].lp
				chatter.emit("candleStickUpdate-", "5min", candle5Minute[symbol])
				// remove the 5 minute candle
				candle5Minute[symbol] = null
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
	// Start the cron jobs
	jobEvery1Minute.start()
	jobEvery5Minutes.start()
}
