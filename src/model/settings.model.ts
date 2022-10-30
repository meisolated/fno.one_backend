import { Schema } from "mongoose"

interface settings {
    realTimeMarketsToWatch: string[]
    keepRealTimeMarketsData: boolean
    keepRealTimeMarketsDataFor: number
    callStrikePrice: string //[ATM, OTM, ITM]
    putStrikePrice: string //[ATM, OTM, ITM]
    callStrikePriceRange: number // [0, 100]
    activeStrategies: string[]
    globalStopLoss: number
    globalTakeProfit: number
    globalDailyTrades: number
    userLimit: number
}

export default new Schema<settings>(
    {
        realTimeMarketsToWatch: [{ type: String, required: true }],
        keepRealTimeMarketsData: { type: Boolean },
        keepRealTimeMarketsDataFor: { type: Number },
        callStrikePrice: { type: String },
        putStrikePrice: { type: String },
        callStrikePriceRange: { type: Number },
        activeStrategies: [{ type: String, required: true }],
        globalStopLoss: { type: Number },
        globalTakeProfit: { type: Number },
        globalDailyTrades: { type: Number },
        userLimit: { type: Number },
    },
    { timestamps: true }
)
