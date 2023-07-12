import { datePassed } from "../helper"
import { MarketData } from "../model"
export const getExpiryList = async (symbol: string) => {
	const marketData = await MarketData.findOne({ id: 1 })
	if (marketData) {
		if (symbol == "BANKNIFTY") {
			return marketData.BANKNIFTY.expiryDates
		} else if (symbol == "NIFTY") {
			return marketData.NIFTY.expiryDates
		} else if (symbol == "FINNIFTY") {
			return marketData.FINNIFTY.expiryDates
		}
	}
}
export const currentExpiry = async (symbol: string) => {
	const marketData = await MarketData.findOne({ id: 1 })
	if (marketData) {
		if (symbol == "BANKNIFTY") {
			let UpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})
			return UpcomingExpiry[0]
		} else if (symbol == "NIFTY") {
			let UpcomingExpiry = marketData.NIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})
			return UpcomingExpiry[0]
		} else if (symbol == "FINNIFTY") {
			let UpcomingExpiry = marketData.FINNIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})
			return UpcomingExpiry[0]
		}
	}
}
