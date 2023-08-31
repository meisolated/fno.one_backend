import logger from "../logger"
import { SymbolData } from "../model"

export const checkIfAllMarketDataTicksAreBeingProvidedByProvider = async (symbolsAsked: Array<String>, symbolList: String[][]) => {
	const notFoundList = symbolsAsked
	symbolList.forEach(async (symbol) => {
		if (symbolsAsked.includes(symbol[0])) notFoundList.splice(notFoundList.indexOf(symbol[0]), 1)
		try {
			const filter = { trueDataSymbol: symbol[0] }
			const update = { ltp: symbol[3], lastUpdated: new Date() }
			const result = await SymbolData.findOneAndUpdate(filter, update, {
				upsert: true, // Create if not exists
				new: true, // Return updated document
			})
			if (result) return
			else return logger.error(`[verify.ts] checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${symbol[0]} not found in SymbolData`)
		} catch (error) {
			return logger.error(`[verify.ts] checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${error}`)
		}
	})
	logger.info(`[verify.ts] checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${notFoundList.length == 0 ? "All symbols confirmed" : `Missing symbols: ${notFoundList}`}`)
	return
}
