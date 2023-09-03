import { getConfigData } from "../config/initialize"
import { FyersMonthStringToNumber, TrueDataMonthStringToNumber, datePassed } from "../helper"
import HistoricalData from "../lib/trueData/historical"
import logger from "../logger"
import { MarketData, SymbolData } from "../model"
const indicesSymbol = ["NIFTY 50", "NIFTY BANK", "NIFTY FIN SERVICE", "INDIA VIX", "NIFTY IT"]
const bankNiftyUnderlyingAssets = ["HDFCNIFBAN", "SETFNIFBK", "ICICIBANKN", "KOTAKBANK", "AXISBANK", "INDUSINDBK", "AUBANK", "BANKBARODA", "FEDERALBNK", "BANDHANBNK"]

export var _baseSymbolsList: any = []
export var _optionChainSymbolsList: any = {}

export const generateSymbolsList = async () => {
	const marketData = await MarketData.findOne({ id: 1 })
	if (marketData) {
		const BANKNIFTYUpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
			if (!datePassed(expiryDate)) {
				return expiryDate
			}
		})
		SymbolData.deleteMany({}).then(() => logger.info("Deleted all symbols"))
		marketData.BANKNIFTY.strikePrices.forEach(async (strikePrice) => {
			await SymbolData.create({
				trueDataSymbol: TrueDataSymbolMaker("BANKNIFTY", BANKNIFTYUpcomingExpiry[0], strikePrice, "CE"),
				fyersSymbol: FyersSymbolMaker("NSE", "BANKNIFTY", BANKNIFTYUpcomingExpiry[0], strikePrice, "CE"),
				ltp: 0,
				lastUpdated: new Date(),
			})
			await SymbolData.create({
				trueDataSymbol: TrueDataSymbolMaker("BANKNIFTY", BANKNIFTYUpcomingExpiry[0], strikePrice, "PE"),
				fyersSymbol: FyersSymbolMaker("NSE", "BANKNIFTY", BANKNIFTYUpcomingExpiry[0], strikePrice, "PE"),
				ltp: 0,
				lastUpdated: new Date(),
			})
		})
	} else {
		logger.error("Market Data not found")
		return false
	}
}
export const baseSymbolsList = async () => {
	if (_baseSymbolsList.length > 0) return _baseSymbolsList
	const settings = {
		numberOfOptions: 10, // Number of options to be fetched both above and below the current price
		numberOfSymbolsAllowed: 200,
		includeUnderlyingAssets: true, // Include the underlying asset in the list of symbols
		onlyIncludeSymbolsOfCurrentExpiry: true, // Only include symbols of the current expiry
		whichMarketOptionsToInclude: "BANKNIFTY", // "all" or "nifty" or "banknifty" or "finnifty"
		whichMarketUnderlyingToInclude: "BANKNIFTY", // "all" or "nifty" or "banknifty" or "finnifty"
		indicesSymbol: indicesSymbol,
		bankNiftyUnderlyingAssets: bankNiftyUnderlyingAssets,
	}
	if (settings.whichMarketOptionsToInclude === "BANKNIFTY") {
		const marketData = await MarketData.findOne({ id: 1 })
		if (marketData) {
			try {
				let currentPrice: any = await SymbolData.findOne({ trueDataSymbol: "NIFTY BANK" }).then(async (data: any) => {
					if (!data || data.ltp == 0) {
						const historical = new HistoricalData()
						const BankNiftyCurrentPrice: any = await historical.getLastNBars("NIFTY BANK", 1, "1min")
						return BankNiftyCurrentPrice.Records[0][4]
					} else {
						return data.ltp
					}
				})
				const roundOffCurrentPrice = Math.round(currentPrice / 100) * 100

				// get upcoming expiry date
				const BANKNIFTYUpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
					if (!datePassed(expiryDate)) {
						return expiryDate
					}
				})

				// based on current price take 10 options above and below
				const _symbols = generateOptionChainSymbolsList("BANKNIFTY", settings.numberOfOptions, roundOffCurrentPrice, BANKNIFTYUpcomingExpiry[0])
				const symbols = _symbols.map((symbol: any) => symbol.CE).concat(_symbols.map((symbol: any) => symbol.PE))
				const uniqueSymbols = [...symbols, ...settings.indicesSymbol, ...settings.bankNiftyUnderlyingAssets]
				logger.info(`Total number of symbols: ${uniqueSymbols.length}`)
				_baseSymbolsList = uniqueSymbols
				return uniqueSymbols

				//---------------------------------------------
			} catch (error) {
				logger.error(`Error in fetching symbols list: ${error}`)
			}
		}
	}
}

export const optionChainSymbols = async (symbol: string) => {
	const numberOfOptions = 10
	if (symbol.includes("BANKNIFTY")) {
		// if (_optionChainSymbolsList[symbol]) return _optionChainSymbolsList[symbol]
		try {
			let currentPrice: any = await SymbolData.findOne({ trueDataSymbol: "NIFTY BANK" }).then(async (data: any) => {
				if (data.ltp == 0) {
					const historical = new HistoricalData()
					const BankNiftyCurrentPrice: any = await historical.getLastNBars("NIFTY BANK", 1, "1min")
					return BankNiftyCurrentPrice.Records[0][4]
				} else {
					return data.ltp
				}
			})
			const roundOffCurrentPrice = Math.round(currentPrice / 100) * 100
			const marketData = await MarketData.findOne({ id: 1 })
			if (marketData) {
				// get upcoming expiry date
				let UpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
					if (!datePassed(expiryDate)) {
						return expiryDate
					}
				})
				//---------------------------------------------
				const symbols = generateOptionChainSymbolsList(symbol, numberOfOptions, roundOffCurrentPrice, UpcomingExpiry[0])
				const query = { trueDataSymbol: { $in: symbols.map((symbol: any) => symbol.CE).concat(symbols.map((symbol: any) => symbol.PE)) } }
				const LTP = await SymbolData.find(query).then((data: any) => {
					return data.reduce((map: any, obj: any) => {
						map[obj.trueDataSymbol] = obj.ltp
						return map
					}, {})
				})
				symbols.forEach((symbol: any) => {
					symbol.PE_LTP = LTP[symbol.PE]
					symbol.CE_LTP = LTP[symbol.CE]
				})
				_optionChainSymbolsList = { [symbol]: symbols }
				return symbols
			} else {
				logger.error("Market Data not found")
				return false
			}
		} catch (error) {
			logger.error(`Error in fetching symbols list: ${error}`)
			return false
		}
	} else {
		logger.error("Symbol not found")
		return false
	}
}

/**
 *
 * @param symbol symbol name
 * @param numberOfOptions number
 * @param roundOffCurrentPrice number
 * @param upcomingExpiry DD-MM-YYYY
 * @returns Array of {CE: string, PE: string, strike: number, other: {fy: {PE: string, CE: string}}}
 */
const generateOptionChainSymbolsList = (symbol: string, numberOfOptions: number, roundOffCurrentPrice: number, upcomingExpiry: string) => {
	const strikePrices = [roundOffCurrentPrice]
	const symbols: Array<Object> = []
	for (let i = 0; i < numberOfOptions; i++) {
		if (i === 0) continue
		strikePrices.push(roundOffCurrentPrice - 100 * i)
		strikePrices.push(roundOffCurrentPrice + 100 * i)
	}
	strikePrices.sort((a, b) => a - b)
	strikePrices.forEach(async (strikePrice) => {
		const TD_CE: string = TrueDataSymbolMaker(symbol, upcomingExpiry, strikePrice, "CE")
		const TD_PE: string = TrueDataSymbolMaker(symbol, upcomingExpiry, strikePrice, "PE")
		const FY_CE: string = FyersSymbolMaker("NSE", symbol, upcomingExpiry, strikePrice, "CE")
		const FY_PE: string = FyersSymbolMaker("NSE", symbol, upcomingExpiry, strikePrice, "PE")
		return symbols.push({ CE: TD_CE, PE: TD_PE, strike: strikePrice, other: { fy: { PE: FY_PE, CE: FY_CE } } })
	})
	return symbols
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
	const DD = expiryDate.split("-")[0] == "07" ? "06" : expiryDate.split("-")[0]
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

const symbols = [
	{
		symbol: "NIFTY 50",
		trueData: "NIFTY 50",
		fyers: "NSE:NIFTY50-INDEX",
	},
	{
		symbol: "NIFTY BANK",
		trueData: "NIFTY BANK",
		fyers: "NSE:NIFTYBANK-INDEX",
	},
	{
		symbol: "FINNIFTY",
		trueData: "FINNIFTY-I",
		fyers: "NSE:FINNIFTY-INDEX",
	},
	{
		symbol: "INDIA VIX",
		trueData: "INDIA VIX",
		fyers: "NSE:INDIAVIX-INDEX",
	},
	{
		symbol: "NIFTY IT",
		trueData: "NIFTY IT",
		fyers: "NSE:NIFTYIT-INDEX",
	},
	{
		symbol: "HDFCBANK",
		trueData: "HDFCBANK",
		fyers: "NSE:HDFCBANK-EQ",
	},

	// NIFTY 50
	// HDFC Bank Ltd. 14.10
	// Reliance Industries Ltd. 9.87
	// ICICI Bank Ltd. 7.99
	// Infosys Ltd. 5.54
	// ITC Ltd. 4.70
	// Tata Consultancy Services Ltd. 4.01
	// Larsen & Toubro Ltd. 3.71
	// Kotak Mahindra Bank Ltd. 3.12
	// Axis Bank Ltd. 2.99
	// State Bank of India 2.72

	// BANKNIFTY
	// HDFC Bank Ltd. 28.42
	// ICICI Bank Ltd. 24.04
	// State Bank of India 9.89
	// Kotak Mahindra Bank Ltd. 9.40
	// Axis Bank Ltd. 9.35
	// IndusInd Bank Ltd. 6.74
	// Bank of Baroda 2.75
	// AU Small Finance Bank Ltd. 2.56
	// Federal Bank Ltd. 2.33
	// IDFC First Bank Ltd. 1.98
]
