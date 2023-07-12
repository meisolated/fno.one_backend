import { EventEmitter } from "events"
export default {
	name: "trafficLight",
	description: "Two Red and Green Candle Pair after 9:20 AM IST. On break of high or low of that pair, take trade in that direction.",
	enabled: true,
	run: async function (eventEmitter: EventEmitter, markets = []) {

	}
}
