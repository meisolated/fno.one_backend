import { getConfigData } from "../config/initialize"
import symbols from "../config/symbols"
import chatter from "../events"
import trueData from "../lib/trueData"
import logger from "../logger"
import { allIndiesOptionChainGenerator } from "../provider/symbols.provider"

const connectTrueDataMarketDataSocket = async () => {
	try {
		const config = getConfigData()
		const symbolsList: any = [...symbols]
		const allIndiesOptionChain = await allIndiesOptionChainGenerator()
		let allIndiesOptionChainCombineSymbolsOnlyList: Array<String> = []
		allIndiesOptionChain.indies.map((item: any) => {
			allIndiesOptionChain[item.optionPrefix].map((item: any) => allIndiesOptionChainCombineSymbolsOnlyList.push(item.CE))
			allIndiesOptionChain[item.optionPrefix].map((item: any) => allIndiesOptionChainCombineSymbolsOnlyList.push(item.PE))
		})
		const trueDataConnection = new trueData.MarketFeeds(
			config.apis.trueData.username,
			config.apis.trueData.password,
			[...symbolsList, ...allIndiesOptionChainCombineSymbolsOnlyList],
			"live",
			true,
			false,
		)
		chatter.on("trueDataLibMarketDataUpdates-", "askReconnect", async (data: any) => {
			trueDataConnection.closeConnection()
			trueDataConnection.connect()
		})
	} catch (err: any) {
		logger.error("Error in connecting to true data socket", "trueData.handler")
	}
}
export { connectTrueDataMarketDataSocket }
