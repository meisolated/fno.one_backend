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
		chatter.on("trueDataLibMarketDataUpdates-", "askReconnect", async (data: any) => {
			trueDataConnection.closeConnection()
			trueDataConnection.connect()
		})
	} catch (err: any) {
		logger.error("Error in connecting to true data socket", "trueData.handler")
	}
}
export { connectTrueDataMarketDataSocket }
