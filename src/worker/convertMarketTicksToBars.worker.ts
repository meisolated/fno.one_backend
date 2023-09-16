
import chatter from "../events"
import { timePassed } from "../helper"
import logger from "../logger"
import { HistoricalData } from "../model"
import { isTodayHoliday } from "../provider/marketData.provider"
/**
 * @deprecated This file has many inconsistencies and is not used anymore
 */
export default class convertMarketTicksToBars {
	primaryInterval: NodeJS.Timeout | undefined
	OneMinuteBarsInterval: NodeJS.Timeout | undefined
	FiveMinuteBarsInterval: NodeJS.Timeout | undefined
	FifteenMinuteBarsInterval: NodeJS.Timeout | undefined
	DailyBarsInterval: NodeJS.Timeout | undefined
	realTimeData: any = {}
	highsAndLows: any = {}
	OneMinuteCurrentBar: any = {}
	FiveMinuteCurrentBar: any = {}
	FifteenMinuteCurrentBar: any = {}
	DailyCurrentBar: any = {}
	constructor() {

	}
	start() {
		logger.info("Worker convertMarketTicksToBars online", "worker-convertMarketTicksToBars")
		this.primaryInterval = setInterval(async () => {
			// only start other intervals at  9:15 AM and clear all intervals at 3:30 PM
			// except saturday and sunday
			const todayHoliday = await isTodayHoliday()
			if (todayHoliday) return
			if (timePassed(9, 15) && !timePassed(15, 30)) {
				if (this.primaryInterval && this.OneMinuteBarsInterval && this.FiveMinuteBarsInterval && this.FifteenMinuteBarsInterval && this.DailyBarsInterval) return
				const currentTime = new Date()
				const currentSeconds = currentTime.getSeconds()
				if (currentSeconds === 0) {
					logger.info("Starting convertMarketTicksToBars")
					this.OneMinute()
					this.FiveMinute()
					this.FifteenMinute()
					this.Daily()
				}
			}
			if (timePassed(15, 30)) {
				logger.info("Stopping convertMarketTicksToBars")
				this.stop()
			}
		}, 1000)
		chatter.on("symbolUpdateTicks-", "tick", (symbolData: symbolTicks) => {

			this.realTimeData[symbolData.symbol] = symbolData
			const updateHightAndLowData = (symbolData: symbolTicks) => {
				const { symbol, highPrice, lowPrice } = symbolData
				if (!this.highsAndLows[symbol]) {
					this.highsAndLows[symbol] = {
						high: highPrice,
						low: lowPrice,
					}
				}
				if (highPrice > this.highsAndLows[symbol].high) {
					this.highsAndLows[symbol].high = highPrice
				}
				if (lowPrice < this.highsAndLows[symbol].low) {
					this.highsAndLows[symbol].low = lowPrice
				}
			}
			updateHightAndLowData(symbolData)
		})
	}
	stop() {
		clearInterval(this.primaryInterval!)
		clearInterval(this.OneMinuteBarsInterval!)
		clearInterval(this.FiveMinuteBarsInterval!)
		clearInterval(this.FifteenMinuteBarsInterval!)
		clearInterval(this.DailyBarsInterval!)
	}
	private OneMinute() {
		const main = async () => {
			for (const symbol in this.realTimeData) {
				if (!this.OneMinuteCurrentBar[symbol]) {
					this.OneMinuteCurrentBar[symbol] = {
						symbol,
						resolution: "1",
						t: new Date().toISOString(),
						o: this.realTimeData[symbol].openPrice,
						h: "",
						l: "",
						c: "",
						v: this.realTimeData[symbol].volume,
					}
				} else {
					this.OneMinuteCurrentBar[symbol].v += this.realTimeData[symbol].volume
					this.OneMinuteCurrentBar[symbol].c = this.realTimeData[symbol].lp
					this.OneMinuteCurrentBar[symbol].h = this.highsAndLows[symbol].high
					this.OneMinuteCurrentBar[symbol].l = this.highsAndLows[symbol].low
					this.OneMinuteCurrentBar[symbol].t = new Date().toISOString()
					console.log(this.OneMinuteCurrentBar[symbol])
					// await HistoricalData.create(this.OneMinuteCurrentBar[symbol])
					this.OneMinuteCurrentBar[symbol] = undefined
					this.highsAndLows[symbol] = undefined
				}
			}
		}
		this.OneMinuteBarsInterval = setInterval(() => {
			main()
		}, 1000 * 60)
		main()
	}
	private FiveMinute() {
		const main = async () => {
			for (const symbol in this.realTimeData) {
				if (!this.FiveMinuteCurrentBar[symbol]) {
					this.FiveMinuteCurrentBar[symbol] = {
						symbol,
						resolution: "5",
						t: new Date().toISOString(),
						o: this.realTimeData[symbol].openPrice,
						h: "",
						l: "",
						c: "",
						v: this.realTimeData[symbol].volume,
					}
				} else {
					this.FiveMinuteCurrentBar[symbol].v += this.realTimeData[symbol].volume
					this.FiveMinuteCurrentBar[symbol].c = this.realTimeData[symbol].lp
					this.FiveMinuteCurrentBar[symbol].h = this.highsAndLows[symbol].high
					this.FiveMinuteCurrentBar[symbol].l = this.highsAndLows[symbol].low
					this.FiveMinuteCurrentBar[symbol].t = new Date().toISOString()
					console.log(this.FiveMinuteCurrentBar[symbol])
					// await HistoricalData.create(this.FiveMinuteCurrentBar[symbol])
					this.FiveMinuteCurrentBar[symbol] = undefined
					this.highsAndLows[symbol] = undefined
				}
			}
		}
		this.FiveMinuteBarsInterval = setInterval(() => {
			main()
		}, 1000 * 60 * 5)
		main()
	}
	private FifteenMinute() {
		const main = async () => {
			for (const symbol in this.realTimeData) {
				if (!this.FifteenMinuteCurrentBar[symbol]) {
					this.FifteenMinuteCurrentBar[symbol] = {
						symbol,
						resolution: "15",
						t: new Date().toISOString(),
						o: this.realTimeData[symbol].openPrice,
						h: "",
						l: "",
						c: "",
						v: this.realTimeData[symbol].volume,
					}
				} else {
					this.FifteenMinuteCurrentBar[symbol].v += this.realTimeData[symbol].volume
					this.FifteenMinuteCurrentBar[symbol].c = this.realTimeData[symbol].lp
					this.FifteenMinuteCurrentBar[symbol].h = this.highsAndLows[symbol].high
					this.FifteenMinuteCurrentBar[symbol].l = this.highsAndLows[symbol].low
					this.FifteenMinuteCurrentBar[symbol].t = new Date().toISOString()
					console.log(this.FifteenMinuteCurrentBar[symbol])
					// await HistoricalData.create(this.FifteenMinuteCurrentBar[symbol])
					this.FifteenMinuteCurrentBar[symbol] = undefined
					this.highsAndLows[symbol] = undefined
				}
			}
		}
		this.FifteenMinuteBarsInterval = setInterval(() => {
			main()
		}, 1000 * 60 * 15)
		main()
	}
	private Daily() {
		const main = async () => {
			for (const symbol in this.realTimeData) {
				if (!this.DailyCurrentBar[symbol]) {
					this.DailyCurrentBar[symbol] = {
						symbol,
						resolution: "1D",
						t: new Date().toISOString(),
						o: this.realTimeData[symbol].openPrice,
						h: "",
						l: "",
						c: "",
						v: this.realTimeData[symbol].volume,
					}
				} else {
					this.DailyCurrentBar[symbol].v += this.realTimeData[symbol].volume
					this.DailyCurrentBar[symbol].c = this.realTimeData[symbol].lp
					this.DailyCurrentBar[symbol].h = this.highsAndLows[symbol].high
					this.DailyCurrentBar[symbol].l = this.highsAndLows[symbol].low
					this.DailyCurrentBar[symbol].t = new Date().toISOString()
					console.log(this.DailyCurrentBar[symbol])
					// await HistoricalData.create(this.DailyCurrentBar[symbol])
					this.DailyCurrentBar[symbol] = undefined
					this.highsAndLows[symbol] = undefined
				}
			}
		}
		this.DailyBarsInterval = setInterval(() => {
			main()
		}, 1000 * 60 * 60 * 6 + 1000 * 60 * 15)
		main()
	}
}

// 234.85 {
// 	symbolId: 100000179,
// 	symbol: 'BANDHANBNK',
// 	originalName: 'BANDHANBNK',
// 	shortName: 'BANDHANBNK',
// 	description: 'BANDHANBNK',
// 	exchange: 'NSE',
// 	openPrice: 234.85,
// 	highPrice: 234.9,
// 	lowPrice: 234.65,
// 	prevClosePrice: 234.65,
// 	ch: 0.19999999999998863,
// 	tt: 1693971900000,
// 	cmd: {
// 	  c: 234.85,
// 	  h: 234.9,
// 	  l: 234.65,
// 	  o: 234.85,
// 	  t: 1693971900000,
// 	  v: 16518,
// 	  tf: ''
// 	},
// 	chp: 0.0852333262305513,
// 	lp: 234.85,
// 	LTQ: 9171,
// 	L2LTT: 1693971900000,
// 	ATP: 234.8,
// 	volume: 16518,
// 	totBuy: 423,
// 	totSell: 589,
// 	bid: 234.7,
// 	ask: 234.9,
// 	spread: 0.20000000000001705,
// 	marketStat: 1
//   } 2023-09-06T03:45:00.000Z
