import { indiesConfig } from "../config/symbols"
import { FyersMonthStringToNumberInMFormat, TrueDataMonthStringToNumber, datePassed } from "../helper"
import HistoricalData from "../lib/trueData/historical"
import logger from "../logger"
import { MarketData, SymbolData } from "../model"
export const indicesSymbol = ["NIFTY 50", "NIFTY BANK", "NIFTY FIN SERVICE", "NIFTY IT", "INDIA VIX"]
export const bankNiftyUnderlyingAssets = ["HDFCNIFBAN", "SETFNIFBK", "ICICIBANKN", "KOTAKBANK", "AXISBANK", "INDUSINDBK", "AUBANK", "BANKBARODA", "FEDERALBNK", "BANDHANBNK"]

export var _baseSymbolsList: any = []
export var _optionChainSymbolsList: any = {}

export const allIndiesOptionChainGenerator = async () => {
	const indies = [
		{
			symbol: "NIFTY BANK",
			optionPrefix: "BANKNIFTY",
		},
		{
			symbol: "NIFTY 50",
			optionPrefix: "NIFTY",
		},
		{
			symbol: "NIFTY FIN SERVICE",
			optionPrefix: "FINNIFTY",
		},
	]
	const optionChain: any = {
		indies: indies,
	}
	const marketData: any = await MarketData.findOne({ id: 1 })
	if (marketData) {
		await Promise.all(
			indies.map(async (index: any) => {
				const upcomingExpiry = marketData[index.optionPrefix].expiryDates.filter((expiryDate: any) => {
					if (!datePassed(expiryDate)) {
						return expiryDate
					}
				})
				const strikePrices = marketData[index.optionPrefix].strikePrices
				const currentPrice: any = await SymbolData.findOne({ trueDataSymbol: index.symbol }).then(async (data: any) => {
					if (!data || data.ltp == 0) {
						const historical = new HistoricalData()
						const symbolCurrentPrice: any = await historical.getLastNBars(index.symbol, 1, "1min")
						return symbolCurrentPrice.Records[0][4]
					} else {
						return data.ltp
					}
				})
				const roundOffCurrentPrice = Math.round(currentPrice / 100) * 100
				const gaps = indiesConfig[index.optionPrefix].strikePriceGap
				const symbols = generateOptionChainSymbolsList(index.optionPrefix, 10, roundOffCurrentPrice, upcomingExpiry[0], gaps)
				await Promise.all(
					symbols.map(async (symbol: any) => {
						const query = { trueDataSymbol: { $in: [symbol.CE, symbol.PE] } }
						const LTP = await SymbolData.find(query).then((data: any) => {
							return data.reduce((map: any, obj: any) => {
								map[obj.trueDataSymbol] = obj.ltp
								return map
							}, {})
						})
						symbol.PE_LTP = LTP[symbol.PE] || 0
						symbol.CE_LTP = LTP[symbol.CE] || 0
					}),
				)
				return (optionChain[index.optionPrefix] = symbols)
			}),
		)
		return optionChain
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
const generateOptionChainSymbolsList = (symbol: string, numberOfOptions: number, roundOffCurrentPrice: number, upcomingExpiry: string, gaps: number) => {
	const strikePrices = [roundOffCurrentPrice]
	const symbols: Array<Object> = []
	for (let i = 0; i < numberOfOptions; i++) {
		if (i === 0) continue
		strikePrices.push(roundOffCurrentPrice - gaps * i)
		strikePrices.push(roundOffCurrentPrice + gaps * i)
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
const FyersSymbolMaker = (ex: string, symbol: string, expiryDate: string, strikePrice: number, optionType: string): string => {
	//for monthly expiry we have to use different format
	const DD = expiryDate.split("-")[0]
	const M = FyersMonthStringToNumberInMFormat(expiryDate.split("-")[1])
	const MMM = expiryDate.split("-")[1].slice(0, 3).toUpperCase()
	const YY = expiryDate.split("-")[2].slice(2, 4)
	const prepareExpiryDate = YY + M + DD
	if (hasAnotherOccurrenceAfterExpiry(expiryDate, indiesConfig[symbol].monthlyExpiryDay)) {
		return `${ex}:${symbol}${prepareExpiryDate}${strikePrice}${optionType}`
	} else {
		return `${ex}:${symbol}${YY}${MMM}${strikePrice}${optionType}`
	}
}

function hasAnotherOccurrenceAfterExpiry(expiryDateStr: string, expiryDay: string) {
	// expiryDateStr format is DD-MM-YYYY
	const expiryDate = new Date(expiryDateStr)
	const expiryDateDay = expiryDate.getDate()
	const numberOfDaysInTheExpiryMonth = new Date(expiryDate.getFullYear(), expiryDate.getMonth() + 1, 0).getDate()
	if (expiryDateDay + 7 >= numberOfDaysInTheExpiryMonth) {
		return false
	}
	return true
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
