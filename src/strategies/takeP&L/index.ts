import { EventEmitter } from "events"
export default {
	strategyName: "takeP&L",
	strategyDescription: "This strategy will take profit and loss",
	strategyVersion: "1.0.0",
	strategyAuthor: "Vivek",
	strategyParameters: {
		maxProfit: {
			type: "number",
			description: "Max profit in percentage",
			default: 0.5,
		},
	},
	runner(chatter: EventEmitter, params: any) {
		chatter.on("marketDataUpdate", (data: any) => {
			console.log(data)
		})
		chatter.on("orderUpdate", (data: any) => {
			console.log(data)
		})
	},
}
