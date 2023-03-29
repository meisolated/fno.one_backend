import { MarketData } from "../model"
export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const getMarketCurrentPrice = async (market: string) => {
    const marketData = await MarketData.findOne({ market: market, timestamp: { sort: { tt: -1 } } })
    if (marketData) {
        return marketData.open_price
    } else {
        return null
    }
}
