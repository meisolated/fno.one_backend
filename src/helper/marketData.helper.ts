import { SymbolTicks } from "../model"

const getMarketCurrentPrice = async (market: string) => {
	const marketData = await SymbolTicks.findOne({ market: market, timestamp: { sort: { tt: -1 } } })
	if (marketData) {
		return marketData.open_price
	} else {
		return null
	}
}

export { getMarketCurrentPrice }
