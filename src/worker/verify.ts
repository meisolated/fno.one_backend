import { SymbolData } from "../model"
import logger from "../logger"

export const checkIfAllMarketDataTicksAreBeingProvidedByProvider = async (symbolsAsked: Array<String>, symbolList: String[][]) => {
    const askedList = symbolsAsked
    symbolList.forEach(async (symbol) => {
        const symbolName = symbol[0]
        if (symbolsAsked.includes(symbolName)) {
            askedList.splice(askedList.indexOf(symbolName), 1)
        }
        const getIfExist = await SymbolData.findOne({ trueDataSymbol: symbolName })
        if (!getIfExist) {
            await SymbolData.create({ symbol: symbolName, trueDataSymbol: symbolName, ltp: symbol[3], lastUpdated: new Date() })
        } else {
            await SymbolData.findOneAndUpdate({ trueDataSymbol: symbolName }, { ltp: symbol[3], lastUpdated: new Date() })
        }
    })

    // we will save ltp of all the symbols in the database

    return logger.info(`[verify.ts] checkIfAllMarketDataTicksAreBeingProvidedByProvider: ${askedList.length == 0 ? "All" : "Some"} symbols are not being provided by provider. ${askedList.length == 0 ? "" : `Missing symbols: ${askedList}`}`)
}
