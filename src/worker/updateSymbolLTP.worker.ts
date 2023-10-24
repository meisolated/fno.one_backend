import chatter from "../events"
import logger from "../logger"
import { SymbolData } from "../model/index"

export default async function updateSymbolLTP() {
	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: symbolTicks) => {
		const prepareData: symbolData = {
			trueDataSymbolId: symbolData.symbolId,
			symbol: symbolData.symbol,
			fyersSymbol: "",
			kiteSymbol: "",
			trueDataSymbol: symbolData.symbol,
			ltp: symbolData.lp,
			lastUpdated: new Date(),
		}
		const filter = { trueDataSymbol: symbolData.symbol }
		const result = await SymbolData.findOneAndUpdate(filter, prepareData, {
			upsert: true, // Create if not exists
			new: true, // Return updated document
		})
		if (result) {
			return
		} else {
			return logger.error(`[updateSymbolLTP.ts] updateSymbolLTP: ${symbolData.symbol} not found in SymbolData`, "updateSymbolLTP.ts")
		}
	})
}
