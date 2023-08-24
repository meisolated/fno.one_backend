import { getConfigData } from "../config/initialize"
import chatter from "../events"
import trueData from "../lib/trueData"
import logger from "../logger"
import { baseSymbolsList } from "../provider/symbols.provider"

const connectTrueDataMarketDataSocket = async () => {
	try {
		const config = getConfigData()
		const symbolsList: any = await baseSymbolsList()
		const trueDataConnection = new trueData.MarketFeeds(config.apis.trueData.username, config.apis.trueData.password, [...symbolsList], "live", true, false)
		// trueDataConnection.dataCallback((data: any) => {
		// 	if (typeof data == "undefined") return logger.warn("Undefined data in market data socket")
		// 	if (data.type == "tick") {
		// 		chatter.emit("trueDataLibMarketDataUpdates-", "tick", data.data)
		// 	}
		// })
		chatter.on("trueDataLibMarketDataUpdates-", "askReconnect", async (data: any) => {
			trueDataConnection.closeConnection()
			trueDataConnection.connect(symbolsList)
		})
	} catch (err: any) {
		logger.error("Error in connecting to true data socket", false, "", "trueData")
	}
}
export { connectTrueDataMarketDataSocket }
