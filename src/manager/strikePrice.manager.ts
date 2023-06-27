import axios from "axios"
import config from "../config"
import { SingleMForMonth, datePassedOrNot } from "../helper"

export const generateSymbolOptionChain = async (option: string) => {
    try {
        const response = await axios.get(config.NSEApi.NSEOptionChainDataAPIUrl(option))
        if (response.status !== 200) return null
        const { records } = response.data
        const currentPrice = records.underlyingValue
        const expiries = records.expiryDates
        const strikePrices = records.strikePrices
        const symbolsArray: any = {}

        const filteredStrikePrices = strikePrices.filter((strikePrice: number) => {
            return strikePrice >= currentPrice - 800 && strikePrice <= currentPrice + 800
        })
        for (const expiry of expiries) {
            symbolsArray[expiry] = []
            for (const strikePrice of filteredStrikePrices) {
                const M = SingleMForMonth(expiry.split("-")[1])
                const YY = 23
                const DD = expiry.split("-")[0]
                const symbolCE = { identifier: `NSE:BANKNIFTY${YY}${M}${DD}${strikePrice}CE`, strikePrice }
                const symbolPE = { identifier: `NSE:BANKNIFTY${YY}${M}${DD}${strikePrice}PE`, strikePrice }
                symbolsArray[expiry].push(symbolCE)
                symbolsArray[expiry].push(symbolPE)
            }
        }
        if (datePassedOrNot(expiries[0])) {
            expiries.shift()
        }

        return { expiryListWithStrikePrices: symbolsArray, strikePrices: filteredStrikePrices, currentExpiry: expiries[0] }
    } catch (_error) {
        return { error: "Unable to fetch data from NSE API" }
    }
}

export const strikePriceProvider = async (zone: string) => { }
