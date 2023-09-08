import chatter from "../events"
let symbolTicks: any = {}
chatter.on("symbolUpdateTicks-", "tick", (symbolData: symbolTicks) => {})

export default class convertMarketTicksToBars {
	primaryInterval: NodeJS.Timeout | undefined
	OneMinuteBarsInterval: NodeJS.Timeout | undefined
	FiveMinuteBarsInterval: NodeJS.Timeout | undefined
	FifteenMinuteBarsInterval: NodeJS.Timeout | undefined
	DailyBarsInterval: NodeJS.Timeout | undefined
	realTimeData: any = {}
	OneMinuteCurrentBar: any = {}
	FiveMinuteCurrentBar: any = {}
	FifteenMinuteCurrentBar: any = {}
	DailyCurrentBar: any = {}
	constructor() {}
	start() {
		this.primaryInterval = setInterval(() => {
			// only start other intervals at  9:15 AM and clear all intervals at 3:30 PM
			const currentTime = new Date()
			const currentHour = currentTime.getHours()
			const currentMinute = currentTime.getMinutes()
			const currentSecond = currentTime.getSeconds()
			if (currentHour === 9 && currentMinute === 15 && currentSecond === 0) {
				this.OneMinute()
				this.FiveMinute()
				this.FifteenMinute()
				this.Daily()
			}
			if (currentHour === 15 && currentMinute === 30 && currentSecond === 0) {
				clearInterval(this.primaryInterval)
				clearInterval(this.OneMinuteBarsInterval)
				clearInterval(this.FiveMinuteBarsInterval)
				clearInterval(this.FifteenMinuteBarsInterval)
				clearInterval(this.DailyBarsInterval)
			}
		}, 1000)
	}
	stop() {}
	private OneMinute() {
		this.OneMinuteBarsInterval = setInterval(() => {}, 1000 * 60)
		function main() {}
	}
	private FiveMinute() {
		this.FiveMinuteBarsInterval = setInterval(() => {}, 1000 * 60 * 5)
	}
	private FifteenMinute() {
		this.FifteenMinuteBarsInterval = setInterval(() => {}, 1000 * 60 * 15)
	}
	private Daily() {
		this.DailyBarsInterval = setInterval(() => {}, 1000 * 60 * 60 * 24)
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
