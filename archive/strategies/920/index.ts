import chatter from "../../../events"
import logger from "../../../logger"

export default class NineTwenty {
	private _name: string = "trafficLight"
	public enabled: boolean = false
	public name = "920"
	public id = "920"
	constructor() { }
	public async run(markets: Array<string>) {
		logger.info(`Running ${this._name} strategy`, "strategies/920/index.ts")
	}
}
