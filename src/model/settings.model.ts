import { Schema } from "mongoose"

interface settings {
    id: Number
    realTimeMarketsToWatch: string[]
    keepRealTimeMarketsData: boolean
    activeStrategies: string[]
    globalStopLoss: number
    globalTakeProfit: number
    globalDailyTrades: number
    userLimit: number
    fyers: {
        appId: string
        secretId: string
        redirectUrl: string
        callbackSecret: string
        apiUrl: string
        webSocketUrl: string
        dataApiUrl: string
    }
    NSEApi: {
        NSEOptionQuoteDerivativeAPIUrl: string
        NSEOptionChainDataAPIUrl: string
    }
    lastUpdated: Date
}

export default new Schema<settings>(
    {
        id: { type: Number, required: true, unique: true },
        realTimeMarketsToWatch: [{ type: String, required: true }],
        keepRealTimeMarketsData: { type: Boolean, required: true },
        activeStrategies: [{ type: String, required: false }],
        globalTakeProfit: { type: Number, required: true }, // in percentage and if 0 then no take profit
        globalStopLoss: { type: Number, required: true }, // in percentage and if 0 then no stop loss
        globalDailyTrades: { type: Number, required: true }, // in number of trades and if 0 then no limit
        userLimit: { type: Number }, //if 0 then no limit
        fyers: {
            appId: { type: String, required: true },
            secretId: { type: String, required: true },
            redirectUrl: { type: String, required: true },
            callbackSecret: { type: String, required: true },
            apiUrl: { type: String, required: true },
            dataApiUrl: { type: String, required: true },
            webSocketUrl: { type: String, required: true },
        },
        NSEApi: {
            NSEOptionQuoteDerivativeAPIUrl: { type: String, required: true },
            NSEOptionChainDataAPIUrl: { type: String, required: true },
        },
        lastUpdated: { type: Date, required: true },
    },
    { timestamps: true }
)
