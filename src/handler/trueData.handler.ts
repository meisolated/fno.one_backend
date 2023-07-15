import { getConfigData } from "../config/initialize"
import trueData from "../lib/trueData"
import { baseSymbolsList } from "../provider/symbols.provider"

import chatter from "../events"
import logger from "../logger"

const connectTrueDataMarketDataSocket = async () => {
	try {
		const config = getConfigData()
		const symbolsList: any = await baseSymbolsList()
		const trueDataConnection = new trueData.MarketFeeds(config.apis.trueData.username, config.apis.trueData.password, [...symbolsList], "live", true, false)
		trueDataConnection.dataCallback((data: any) => {
			chatter.emit("trueDataLibMarketDataUpdates-", "tick", data)
		})
		chatter.on("trueDataLibMarketDataUpdates-", "askReconnect", async (data: any) => {
			trueDataConnection.closeConnection()
			trueDataConnection.connect()
		})
	} catch (err: any) {
		logger.error("Error in connecting to true data socket", false, "", "trueData")
	}
}
export { connectTrueDataMarketDataSocket }
