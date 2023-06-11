import { Schema } from "mongoose"

export default new Schema<settings>(
    {
        id: { type: Number, required: true, unique: true },
        // serverSettings: {
        //     port: { type: Number, required: true },
        //     socketPort: { type: Number, required: true },

        // },

        realTimeMarketsToWatch: [{ type: String, required: true }],
        keepRealTimeMarketsData: { type: Boolean, required: true },
        activeStrategies: [{ type: String, required: false }],
        global: {
            maxProfit: { type: Number, required: true },
            maxLoss: { type: Number, required: true },
            maxTradesPerDay: { type: Number, required: true },
            enableRiskManager: { type: Boolean, required: true },
            enableMoneyManager: { type: Boolean, required: true },
        },
        fyers: {
            appId: { type: String, required: true },
            secretId: { type: String, required: true },
            redirectUrl: { type: String, required: true },
            callbackSecret: { type: String, required: true },
            apiUrl: { type: String, required: true },
            dataApiUrl: { type: String, required: true },
            webSocketUrl: { type: String, required: true },
        },
        fyersTrueData: {
            username: { type: String, required: true },
            password: { type: String, required: true },
        },
        NSEApi: {
            NSEOptionQuoteDerivativeAPIUrl: { type: String, required: true },
            NSEOptionChainDataAPIUrl: { type: String, required: true },
        },
        lastUpdated: { type: Date, required: true },
    },
    { timestamps: true }
)
