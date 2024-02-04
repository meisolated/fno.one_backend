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
			allIndiesOptionChain[item.optionPrefix].map((item: any) => allIndiesOptionChainCombineSymbolsOnlyList.push(item.CE) && allIndiesOptionChainCombineSymbolsOnlyList.push(item.PE))
		})
		const _symbols = [...symbolsList, ...allIndiesOptionChainCombineSymbolsOnlyList]
		const trueDataConnection = new trueData.MarketFeeds(config.apis.trueData.username, config.apis.trueData.password, _symbols, "live", true, false)

		chatter.on("trueDataLibMarketDataUpdates-", "askReconnect", async (data: any) => {
			trueDataConnection.closeConnection()
			trueDataConnection.connect()
		})
		chatter.on("trueDataLibMarketDataUpdates-", "updateSymbol", async (data: any) => {
			trueDataConnection.unSubscribe(_symbols)
			trueDataConnection.subscribe(data.sub)
		})

		setInterval(async () => {
			logger.info("Updating true data symbols list", "trueData.handler")
			const symbolsList: any = [...symbols]
			const _allIndiesOptionChain = await allIndiesOptionChainGenerator()
			let _allIndiesOptionChainCombineSymbolsOnlyList: Array<String> = []
			_allIndiesOptionChain.indies.map((item: any) => {
				_allIndiesOptionChain[item.optionPrefix].map((item: any) => _allIndiesOptionChainCombineSymbolsOnlyList.push(item.CE) && _allIndiesOptionChainCombineSymbolsOnlyList.push(item.PE))
			})
			const __symbols = [...symbolsList, ..._allIndiesOptionChainCombineSymbolsOnlyList]
			chatter.emit("trueDataLibMarketDataUpdates-", "updateSymbol", {
				sub: __symbols,
			})
		}, 1000 * 60 * 30)
	} catch (err: any) {
		logger.error("Error in connecting to true data socket", "trueData.handler")
	}
}

export { connectTrueDataMarketDataSocket }
