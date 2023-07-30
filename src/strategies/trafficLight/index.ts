import { EventEmitter } from "events"
import logger from "../../logger"
export default {
	enabled: true,
	id: "trafficLight",
	name: "trafficLight",
	description: "Two Red and Green Candle Pair after 9:25 AM IST. On break of high or low of that pair, take trade in that direction.",
	intervalDuration: 10000, // 10 seconds
	run: async function () {
		logger.info(`Running ${this.name} strategy`)
	},
}
