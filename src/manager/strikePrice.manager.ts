import axios from "axios"
import config from "../config"

const SingleMForMonth = (month: string) => {
    switch (month) {
        case "Jan":
            return "01"
        case "Feb":
            return "02"
        case "Mar":
            return "03"
        case "Apr":
            return "04"
        case "May":
            return "05"
        case "Jun":
            return "06"
        case "Jul":
            return "07"
        case "Aug":
            return "08"
        case "Sep":
            return "09"
        case "Oct":
            return "0"
        case "Nov":
            return "N"
        case "Dec":
            return "D"
    }
}

export const generateSymbolStrikePrices = async (option: string) => {
    if (option === "NIFTY BANK") {
        const { data } = await axios.get(config.NSEApi.NSEOptionChainDataAPIUrl)
        const { records } = data
        const currentPrice = records.underlyingValue
        const expiries = records.expiryDates
        const strikePrices = records.strikePrices
        const symbolsArray: any = {}

        const filteredStrikePrices = strikePrices.filter((strikePrice: number) => {
            return strikePrice >= currentPrice - 1000 && strikePrice <= currentPrice + 1000
        })

        for (const expiry of expiries) {
            symbolsArray[expiry] = []
            for (const strikePrice of filteredStrikePrices) {
                const M = SingleMForMonth(expiry.split("-")[1])
                const YY = 23
                const DD = expiry.split("-")[0]
                const symbolCE = `NSE:BANKNIFTY${YY}${M}${DD}${strikePrice}CE`
                const symbolPE = `NSE:BANKNIFTY${YY}${M}${DD}${strikePrice}PE`
                symbolsArray[expiry].push(symbolCE)
                symbolsArray[expiry].push(symbolPE)
            }
        }
        return { symbolsArray, currentExpiry: expiries[0] }
    }
}
