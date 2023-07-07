import { Schema } from "mongoose"

export default new Schema<settings>(
    {
        id: { type: Number, required: false, unique: true },
        // serverSettings: {
        //     port: { type: Number, required: false },
        //     socketPort: { type: Number, required: false },
        // },

        realTimeMarketsToWatch: [{ type: String, required: false }],
        keepRealTimeMarketsData: { type: Boolean, required: false },
        activeStrategies: [{ type: String, required: false }],
        global: {
            maxProfit: { type: Number, required: false },
            maxLoss: { type: Number, required: false },
            maxTradesPerDay: { type: Number, required: false },
            enableRiskManager: { type: Boolean, required: false },
            enableMoneyManager: { type: Boolean, required: false },
        },
        fyers: {
            appId: { type: String, required: false },
            secretId: { type: String, required: false },
            redirectUrl: { type: String, required: false },
            callbackSecret: { type: String, required: false },
            apiUrl: { type: String, required: false },
            dataApiUrl: { type: String, required: false },
            webSocketUrl: { type: String, required: false },
        },
        fyersTrueData: {
            username: { type: String, required: false },
            password: { type: String, required: false },
        },
        NSEApi: {
            NSEOptionQuoteDerivativeAPIUrl: { type: String, required: false },
            NSEOptionChainDataAPIUrl: { type: String, required: false },
        },
        lastUpdated: { type: Date, required: false },
    },
    { timestamps: true }
)
