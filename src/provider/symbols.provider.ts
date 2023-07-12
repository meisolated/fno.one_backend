import { getConfigData } from "../config/initialize"
import { SingleMForMonth, datePassed } from "../helper"
import HistoricalData from "../lib/trueData/historical"
import logger from "../logger"
import { MarketData } from "../model"
export const baseSymbolsList = async () => {
    const settings = {
        numberOfOptions: 20, // Number of options to be fetched both above and below the current price
        numberOfSymbolsAllowed: 200,
        includeUnderlyingAssets: true, // Include the underlying asset in the list of symbols
        onlyIncludeSymbolsOfCurrentExpiry: true, // Only include symbols of the current expiry
        whichMarketOptionsToInclude: "banknifty", // "all" or "nifty" or "banknifty" or "finnifty"
        whichMarketUnderlyingToInclude: "banknifty", // "all" or "nifty" or "banknifty" or "finnifty"
    }

    if (settings.whichMarketOptionsToInclude === "banknifty") {
        const config = getConfigData()
        const marketData = await MarketData.findOne({ id: 1 })
        if (marketData) {
            const historical = new HistoricalData(config.apis.trueData.userId, config.apis.trueData.password)
            const BankNiftyCurrentPrice: any = await historical.getLastNBars("NIFTY BANK", 1, "1min")
            const currentPrice = BankNiftyCurrentPrice.Records[0][4]
            const roundOffCurrentPrice = Math.round(currentPrice / 100) * 100

            // get upcoming expiry date
            let BANKNIFTYUpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
                if (!datePassed(expiryDate)) {
                    return expiryDate
                }
            })
            //---------------------------------------------

            //prepare expiry date
            const DD = BANKNIFTYUpcomingExpiry[0].split("-")[0]
            const MM = SingleMForMonth(BANKNIFTYUpcomingExpiry[0].split("-")[1])
            const YY = BANKNIFTYUpcomingExpiry[0].split("-")[2].slice(2, 4)
            const prepareExpiryDate = YY + MM + DD
            //---------------------------------------------

            // based on current price take 10 options above and below
            const strikePrices = []
            const symbols: Array<String> = []
            for (let i = 0; i < settings.numberOfOptions; i++) {
                strikePrices.push(roundOffCurrentPrice - 100 * i)
                strikePrices.push(roundOffCurrentPrice + 100 * i)
            }
            strikePrices.sort((a, b) => a - b)
            strikePrices.forEach((strike) => {
                const strikePrice = strike.toString().padStart(5, "0")
                const CE = `BANKNIFTY${prepareExpiryDate}${strikePrice}CE`
                const PE = `BANKNIFTY${prepareExpiryDate}${strikePrice}PE`
                symbols.push(CE)
                symbols.push(PE)
            })
            return symbols

            //---------------------------------------------
        }
    }
}

export const optionChainSymbols = async (symbol: string) => {
    const numberOfOptions = 20
    const config = getConfigData()
    if (symbol.includes("BANKNIFTY")) {
        const historical = new HistoricalData(config.apis.trueData.userId, config.apis.trueData.password)
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

            //prepare expiry date
            const DD = UpcomingExpiry[0].split("-")[0]
            const MM = SingleMForMonth(UpcomingExpiry[0].split("-")[1])
            const YY = UpcomingExpiry[0].split("-")[2].slice(2, 4)
            const prepareExpiryDate = YY + MM + DD
            //---------------------------------------------

            const strikePrices = []
            const symbols: Array<Object> = []
            for (let i = 0; i < numberOfOptions; i++) {
                strikePrices.push(roundOffCurrentPrice - 100 * i)
                strikePrices.push(roundOffCurrentPrice + 100 * i)
            }
            strikePrices.sort((a, b) => a - b)
            strikePrices.forEach((strike) => {
                const strikePrice = strike.toString().padStart(5, "0")
                const CE = `${symbol}${prepareExpiryDate}${strikePrice}CE`
                const PE = `${symbol}${prepareExpiryDate}${strikePrice}PE`
                symbols.push({ CE, PE, strike })
            })
            return symbols
        } else {
            logger.error("Market Data not found")
            return false
        }
    }
}

// Symbols mapping for WebSocket API:

// Equity: - All names same as NSE, e.g. RELIANCE

// Futures (Contract):- eg. NIFTY20APRFUT, NIFTY20MAYFUT (same for MCX)

// Futures (Continuous (Monthly)):- eg. FINNIFTY-I, FINNIFTY-II, FINNIFTY-III, NIFTY-I, NIFTY-II, NIFTY-III  (same for MCX)
// Futures (Continuous (Weekly)) :- eg. FINNIFTY-1, FINNIFTY-2, FINNIFTY-3

// Futures (Continuous - Premium Adjusted) :- e.g. NIFTY-IP, NIFTY-IIP, NIFTY-IIIP (Coming soon)

// Options: - SYMBOL + YY + MM + DD + STRIKE +CE/PE >> e.g. NIFTY20043012000CE (Same format for weekly and monthly futures)

// Indices :- NIFTY 50, NIFTY BANK, INDIA VIX, NIFTY IT
