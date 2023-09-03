import logger from "../logger"
import { SymbolData } from "../model"

export const checkIfAllMarketDataTicksAreBeingProvidedByProvider = async (symbolsAsked: Array<String>, symbolList: String[][]) => {
	const notFoundList = symbolsAsked
	Promise.all(symbolList.map(async (symbol: any) => {
		if (symbolsAsked.includes(symbol[0])) notFoundList.splice(notFoundList.indexOf(symbol[0]), 1)
		try {
			const filter = { trueDataSymbolId: symbol[1] }
			const tryToFind = await SymbolData.findOne(filter)
			const prepareData: symbolData = {
				trueDataSymbolId: symbol[1],
				symbol: symbol[0],
				fyersSymbol: "",
				kiteSymbol: "",
				trueDataSymbol: symbol[0],
				ltp: symbol[3],
				lastUpdated: new Date(),
			}
			if (tryToFind) {
				await SymbolData.updateOne(filter, prepareData)
			} else {
				await SymbolData.create(prepareData)
			}

		} catch (error) {
			return logger.error(`[verify.ts] checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${error}`)
		}
	}))

	return logger.info(`[verify.ts] checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${notFoundList.length == 0 ? "All symbols confirmed" : `Missing symbols: ${notFoundList}`}`)

}
