import { FyersMonthStringToNumber, TrueDataMonthStringToNumber, datePassed } from "../helper"

import HistoricalData from "../lib/trueData/historical"
import { MarketData } from "../model"
import { getConfigData } from "../config/initialize"
import logger from "../logger"

export const baseSymbolsList = async () => {
	const settings = {
		numberOfOptions: 15, // Number of options to be fetched both above and below the current price
		numberOfSymbolsAllowed: 200,
		includeUnderlyingAssets: true, // Include the underlying asset in the list of symbols
		onlyIncludeSymbolsOfCurrentExpiry: true, // Only include symbols of the current expiry
		whichMarketOptionsToInclude: "banknifty", // "all" or "nifty" or "banknifty" or "finnifty"
		whichMarketUnderlyingToInclude: "banknifty", // "all" or "nifty" or "banknifty" or "finnifty"
		mainSymbol: "NIFTY BANK",
		secondarySymbol: "NIFTY",
		thirdSymbol: "FINNIFTY",
		t5BanksSymbol: ["HDFCNIFBAN", "SETFNIFBK", "ICICIBANKN", "KOTAKBANK", "AXISBANK"],
		o5BanksSymbol: ["INDUSINDBK", "AUBANK", "BANKBARODA", "FEDERALBNK", "BANDHANBNK"],
	}

	if (settings.whichMarketOptionsToInclude === "banknifty") {
		const config = getConfigData()
		const marketData = await MarketData.findOne({ id: 1 })
		if (marketData) {
			const historical = new HistoricalData(config.apis.trueData.username, config.apis.trueData.password)
			const BankNiftyCurrentPrice: any = await historical.getLastNBars("NIFTY BANK", 1, "1min")
			const currentPrice = BankNiftyCurrentPrice.Records[0][4]
			const roundOffCurrentPrice = Math.round(currentPrice / 100) * 100

			// get upcoming expiry date
			const BANKNIFTYUpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})

			// based on current price take 10 options above and below
			const strikePrices = []
			const symbols: Array<String> = []
			for (let i = 0; i < settings.numberOfOptions; i++) {
				strikePrices.push(roundOffCurrentPrice - 100 * i)
				strikePrices.push(roundOffCurrentPrice + 100 * i)
			}
			strikePrices.sort((a, b) => a - b)
			strikePrices.forEach((strikePrice) => {
				const CE = TrueDataSymbolMaker("BANKNIFTY", BANKNIFTYUpcomingExpiry[0], strikePrice, "CE")
				const PE = TrueDataSymbolMaker("BANKNIFTY", BANKNIFTYUpcomingExpiry[0], strikePrice, "PE")
				symbols.push(CE)
				symbols.push(PE)
			})
			return [...symbols, settings.mainSymbol, settings.secondarySymbol, ...settings.t5BanksSymbol, ...settings.o5BanksSymbol]

			//---------------------------------------------
		}
	}
}

export const optionChainSymbols = async (symbol: string) => {
	const numberOfOptions = 15
	const config = getConfigData()
	if (symbol.includes("BANKNIFTY")) {
		const historical = new HistoricalData(config.apis.trueData.username, config.apis.trueData.password)
		const currentPrice: any = await historical.getLastNBars("NIFTY BANK", 1, "1min")
		const roundOffCurrentPrice = Math.round(currentPrice.Records[0][4] / 100) * 100

		const marketData = await MarketData.findOne({ id: 1 })
		if (marketData) {
			// get upcoming expiry date
			let UpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})
			//---------------------------------------------

			const strikePrices = []
			const symbols: Array<Object> = []
			for (let i = 0; i < numberOfOptions; i++) {
				strikePrices.push(roundOffCurrentPrice - 100 * i)
				strikePrices.push(roundOffCurrentPrice + 100 * i)
			}
			strikePrices.sort((a, b) => a - b)
			strikePrices.forEach((strikePrice) => {
				const TD_CE = TrueDataSymbolMaker(symbol, UpcomingExpiry[0], strikePrice, "CE")
				const TD_PE = TrueDataSymbolMaker(symbol, UpcomingExpiry[0], strikePrice, "PE")
				const FY_CE = FyersSymbolMaker("NSE", symbol, UpcomingExpiry[0], strikePrice, "CE")
				const FY_PE = FyersSymbolMaker("NSE", symbol, UpcomingExpiry[0], strikePrice, "PE")

				symbols.push({ CE: TD_CE, PE: TD_PE, strike: strikePrice, other: { FY_PE, FY_CE } })
			})
			return symbols
		} else {
			logger.error("Market Data not found")
			return false
		}
	}
}


/**
 * 
 * @param symbol symbol name
 * @param expiryDate expiry date string in format DD-MM-YYYY
 * @param strikePrice strike price string
 * @param optionType CE or PE
 * @returns 
 * 
 */
const TrueDataSymbolMaker = (symbol: string, expiryDate: string, strikePrice: number, optionType: string) => {
	const DD = expiryDate.split("-")[0]
	const MM = TrueDataMonthStringToNumber(expiryDate.split("-")[1])
	const YY = expiryDate.split("-")[2].slice(2, 4)
	const prepareExpiryDate = YY + MM + DD
	return `${symbol}${prepareExpiryDate}${strikePrice}${optionType}`
}
/**
 * 
 * @param ex exchange name
 * @param symbol symbol name
 * @param expiryDate expiry date string in format DD-MM-YYYY
 * @param strikePrice strike price string
 * @param optionType CE or PE
 * @returns ${ex}:${symbol}${prepareExpiryDate}${strikePrice}${optionType}
 */
const FyersSymbolMaker = (ex: string, symbol: string, expiryDate: string, strikePrice: number, optionType: string) => {
	const DD = expiryDate.split("-")[0]
	const M = FyersMonthStringToNumber(expiryDate.split("-")[1])
	const YY = expiryDate.split("-")[2].slice(2, 4)
	const prepareExpiryDate = YY + M + DD
	return `${ex}:${symbol}${prepareExpiryDate}${strikePrice}${optionType}`
}

// Symbols mapping for WebSocket API:

// Equity: - All names same as NSE, e.g. RELIANCE

// Futures (Contract):- eg. NIFTY20APRFUT, NIFTY20MAYFUT (same for MCX)

// Futures (Continuous (Monthly)):- eg. FINNIFTY-I, FINNIFTY-II, FINNIFTY-III, NIFTY-I, NIFTY-II, NIFTY-III  (same for MCX)
// Futures (Continuous (Weekly)) :- eg. FINNIFTY-1, FINNIFTY-2, FINNIFTY-3

// Futures (Continuous - Premium Adjusted) :- e.g. NIFTY-IP, NIFTY-IIP, NIFTY-IIIP (Coming soon)

// Options: - SYMBOL + YY + MM + DD + STRIKE +CE/PE >> e.g. NIFTY20043012000CE (Same format for weekly and monthly futures)

// Indices :- NIFTY 50, NIFTY BANK, INDIA VIX, NIFTY IT
