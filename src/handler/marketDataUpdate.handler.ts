import chatter from "../events"
import logger from "../logger"
import { SymbolTicks } from "../model"
export default async function (data: any) {
	if (typeof data == "undefined") return logger.warn("Undefined data in market data socket")
	if (data.s == "ok") {
		if (data.d["7208"].length > 0) {
			const marketDataArray = data.d["7208"]
			marketDataArray.forEach((marketData: any) => {
				chatter.emit("fyersMarketDataUpdates-", "marketDataUpdate", marketData.v)
				// start saving this data after 9:10 AM
				const currentTime = new Date().getTime()
				const currentHour = new Date(currentTime).getHours()
				const currentMinute = new Date(currentTime).getMinutes()
				if (currentHour < 9 || (currentHour == 9 && currentMinute < 10)) return
				SymbolTicks.insertMany(marketData.v).catch((err) => {
					logger.error(err)
				})
			})
		}
	} else {
		const parsedData = JSON.parse(data)
		if (parsedData.s == "error") {
			logger.error("Error in market data socket " + parsedData)
		}
	}
}
