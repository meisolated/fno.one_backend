import chatter from "../../events"
import HistoricalData from "../../lib/trueData/historical"
import logger from "../../logger"

export default class TrafficLight {
	public id = "trafficLight"
	public name = "trafficLight"
	public enabled: boolean = true
	private _name: string = "trafficLight"
	private _checkForPairInterval: NodeJS.Timeout | null = null
	private _checkFOrPairIntervalTime: number = 5 * 60 * 1000 // 5 minutes

	// strategy specific variables
	private _timeFrame: string = "5m" // historical data time frame
	constructor() {}

	private strategyActive() {
		// check if current time is between 9:15AM and 3:30PM
		const now = new Date()
		const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15, 0)
		const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30, 0)
		return now > startTime && now < endTime
	}

	public async run(markets: Array<string>) {
		logger.info(`Running ${this._name} strategy`)
		const historicalData = new HistoricalData()
		await historicalData.getAccessToken()
		if (!historicalData._accessTokenGenerated) logger.error("Access token not generated")
		if (!this.strategyActive()) return
	}
	private async algorithm(markets: Array<string>) {
		const historicalData = new HistoricalData()
		await historicalData.getAccessToken()
		if (!historicalData._accessTokenGenerated) logger.error("Access token not generated")
		this._checkForPairInterval = setInterval(async () => {
			markets.forEach(async (market) => {
				if (!this.strategyActive()) return

				// get historical data for the last 10 minutes and get give from and to time in YYMMDDTHH:MM:SS format in string
				const now = new Date()
				const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 10, 0)
				const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0)
				const fromString = `${from.getFullYear()}${from.getMonth() + 1}${from.getDate()}T${from.getHours()}:${from.getMinutes()}:${from.getSeconds()}`
				const toString = `${to.getFullYear()}${to.getMonth() + 1}${to.getDate()}T${to.getHours()}:${to.getMinutes()}:${to.getSeconds()}`
				const data = await historicalData.getBarData(market, this._timeFrame, fromString, toString)
			})
		}, this._checkFOrPairIntervalTime)
	}

	public async stop() {
		logger.info(`Stopping ${this._name} strategy`)
		if (this._checkForPairInterval) clearInterval(this._checkForPairInterval)
	}
}
