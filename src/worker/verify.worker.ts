import logger from "../logger"
import { SymbolData } from "../model"

export const checkIfAllMarketDataTicksAreBeingProvidedByProvider = async (symbolsAsked: Array<String>, symbolList: String[][]) => {
	const notFoundList = symbolsAsked
	Promise.all(
		symbolList.map(async (symbol: any) => {
			if (symbolsAsked.includes(symbol[0])) notFoundList.splice(notFoundList.indexOf(symbol[0]), 1)
			try {
				const filter = { trueDataSymbolId: symbol[1] }
				const prepareData: any = {
					trueDataSymbolId: symbol[1],
					symbol: symbol[0],
					trueDataSymbol: symbol[0],
					ltp: symbol[3],
					lastUpdated: new Date(),
				}
				await SymbolData.findOneAndUpdate(filter, prepareData, { new: true, upsert: true })
			} catch (error) {
				return logger.error(`checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${error}`, "verify.ts")
			}
		}),
	)

	return logger.info(`checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${notFoundList.length == 0 ? "All symbols confirmed" : `Missing symbols: ${notFoundList}`}`, "verify.ts")
}
