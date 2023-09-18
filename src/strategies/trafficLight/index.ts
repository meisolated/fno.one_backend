import chatter from "../../events"
import HistoricalData from "../../lib/trueData/historical"
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
	constructor() {}

	private strategyActive() {}
	private pairOldEnoughToLookForAnother(market: string) {}
	public async run(markets: Array<string>) {
		logger.info(`Running ${this._name} strategy`, "strategies/trafficLight/index.ts")
		this.algorithm(markets)
	}
	private async algorithm(markets: Array<string>) {
		this._checkForPairInterval = setInterval(async () => {}, this._checkFOrPairIntervalTime)
	}

	public async stop() {
		logger.info(`Stopping ${this._name} strategy`, "strategies/trafficLight/index.ts")
		if (this._checkForPairInterval) clearInterval(this._checkForPairInterval)
	}
}
