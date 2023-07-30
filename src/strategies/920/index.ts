import { EventEmitter } from "events"
import logger from "../../logger"

export default {
	enabled: true,
	id: "920",
	name: "920",
	description: "A simple strategy, just pick 9:20AM candle and trade on its high or low. Opposite will be SL.",
	intervalDuration: 10000, // 10 seconds
	run: async function () {
		logger.info(`Running ${this.name} strategy`)
	},
}
