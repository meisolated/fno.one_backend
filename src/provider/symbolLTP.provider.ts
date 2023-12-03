import chatter from "../events"
export var symbolLTP: any = {}
export default async function updateSymbolLTP() {
	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		const prepareData: iSymbolData = {
			trueDataSymbolId: symbolData.symbolId,
			symbol: symbolData.symbol,
			fyersSymbol: "",
			kiteSymbol: "",
			trueDataSymbol: symbolData.symbol,
			ltp: symbolData.lp,
			lastUpdated: new Date(),
		}
		symbolLTP[symbolData.symbol] = symbolData.lp
		const filter = { trueDataSymbol: symbolData.symbol }
	})
}
