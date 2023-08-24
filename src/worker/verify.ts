import logger from "../logger"
import { SymbolData } from "../model"

export const checkIfAllMarketDataTicksAreBeingProvidedByProvider = async (symbolsAsked: Array<String>, symbolList: String[][]) => {
    const notFoundList = symbolsAsked
    symbolList.forEach(async (symbol) => {
        const symbolName = symbol[0]
        if (symbolsAsked.includes(symbolName)) {
            notFoundList.splice(notFoundList.indexOf(symbolName), 1)
        }
        const getIfExist = await SymbolData.findOne({ trueDataSymbol: symbolName })
        if (!getIfExist) {
            await SymbolData.create({ symbol: symbolName, trueDataSymbol: symbolName, ltp: symbol[3], lastUpdated: new Date() })
        } else {
            await SymbolData.findOneAndUpdate({ trueDataSymbol: symbolName }, { ltp: symbol[3], lastUpdated: new Date() })
        }
    })

    // we will save ltp of all the symbols in the database

    return logger.info(`[verify.ts] checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${notFoundList.length == 0 ? "All symbols confirmed" : `Missing symbols: ${notFoundList}`}`)
}
