import HistoricalData from "../../lib/trueData/historical"
import chatter from "../../events"
import logger from "../../logger"

export default class TrafficLight {
	public id = "trafficLight"
	public name = "trafficLight"
	public enabled: boolean = true
	private _name: string = "trafficLight"
	private _checkForPairInterval: NodeJS.Timeout | null = null
	private _checkFOrPairIntervalTime: number = 1000 // 1 second

	// strategy specific variables
	private _timeFrame: string = "5min" // historical data time frame
	private _pairsFound: any = {}
	constructor() { }

	private strategyActive() {
		// check if current time is between 9:15AM and 3:30PM
		const now = new Date()
		const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 35, 0)
		const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30, 0)
		return true
		// return now > startTime && now < endTime
	}
	private pairOldEnoughToLookForAnother(market: string) {
		//check is data related to this market is present in _pairsFound
		if (!this._pairsFound[market]) return true
		const lastFoundTime = this._pairsFound[market].time
		// check if its more than 10mins or not
		const now = new Date()
		const lastFound = new Date(lastFoundTime)
		const diff = now.getTime() - lastFound.getTime()
		const diffInMins = Math.floor(diff / 1000 / 60)
		return diffInMins > 10
	}
	public async run(markets: Array<string>) {
		logger.info(`Running ${this._name} strategy`, "strategies/trafficLight/index.ts")
		this.algorithm(markets)
	}
	private async algorithm(markets: Array<string>) {
		const historicalData = new HistoricalData()
		await historicalData.getAccessToken()
		if (!historicalData._accessTokenGenerated) logger.error("Access token not generated", "strategies/trafficLight/index.ts")
		this._checkForPairInterval = setInterval(async () => {
			markets.forEach(async (market) => {
				if (!this.strategyActive()) return
				if (!this.pairOldEnoughToLookForAnother(market)) return
				//current time should end with 0 or 5
				// get historical data for the last 10 minutes and get give from and to time in YYMMDDTHH:MM:SS format in string
				const now = new Date()
				if (now.getMinutes() % 5 !== 0) return
				const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 10, 0)
				const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0)
				const fromString = `${from.getFullYear()}${from.getMonth() + 1}${from.getDate()}T${from.getHours()}:${from.getMinutes()}:${from.getSeconds()}`
				const toString = `${to.getFullYear()}${to.getMonth() + 1}${to.getDate()}T${to.getHours()}:${to.getMinutes()}:${to.getSeconds()}`
				// const data = await historicalData.getBarData(market, this._timeFrame, fromString, toString)
				// if (!data) return this.stop()
				// const records = data.Records
				// if (records.length < 2) return logger.info(`Not enough data for ${market}`)

				// // logic
				// const firstCandle = records[0]
				// const secondCandle = records[1]
				// //check if its traffic light or not
				// const firstCandleColor = firstCandle[1] > firstCandle[4] ? "red" : "green"
				// const secondCandleColor = secondCandle[1] > secondCandle[4] ? "red" : "green"

				// if (firstCandleColor === secondCandleColor) return

				// if (firstCandleColor === "red" && secondCandleColor === "green") {
				// 	//buy
				// 	console.log("Found Pair")
				// 	const high = firstCandle[2] > secondCandle[2] ? firstCandle[2] : secondCandle[2]
				// 	const low = firstCandle[3] < secondCandle[3] ? firstCandle[3] : secondCandle[3]
				// 	this._pairsFound[market] = {
				// 		high,
				// 		low,
				// 		time: new Date()
				// 	}
				// 	console.log({
				// 		market,
				// 		high,
				// 		low,
				// 	})
				// }
			})
		}, this._checkFOrPairIntervalTime)
	}

	public async stop() {
		logger.info(`Stopping ${this._name} strategy`, "strategies/trafficLight/index.ts")
		if (this._checkForPairInterval) clearInterval(this._checkForPairInterval)
	}
}
