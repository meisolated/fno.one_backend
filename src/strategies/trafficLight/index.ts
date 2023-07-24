import { EventEmitter } from "events"
export default {
	id: "trafficLight",
	name: "trafficLight",
	enabled: true,
	description: "Two Red and Green Candle Pair after 9:25 AM IST. On break of high or low of that pair, take trade in that direction.",
	intervalDuration: 10000, // 10 seconds
	interval: null,
	run: async function (eventEmitter: EventEmitter, markets = []) {},
}
