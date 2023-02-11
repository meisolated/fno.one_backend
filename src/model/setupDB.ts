import config from "../config"
import logger from "../logger"
import { Settings } from "./"
const settingsData = {
    id: 1,
    realTimeMarketsToWatch: [
        "NSE:NIFTYBANK-INDEX",
        "NSE:NIFTY50-INDEX",
        "NSE:HDFCBANK-EQ",
        "NSE:SBIN-EQ",
        "NSE:ICICIBANK-EQ",
        "NSE:KOTAKBANK-EQ",
        "NSE:AXISBANK-EQ",
        "NSE:INDUSINDBK-EQ",
        "NSE:AUBANK-EQ",
        "NSE:BANKBARODA-EQ",
        "NSE:FEDERALBNK-EQ",
        "NSE:BANDHANBNK-EQ",
    ],
    keepRealTimeMarketsData: true,
    keepRealTimeMarketsDataFor: 30,
    globalStopLoss: 5,
    globalTakeProfit: 10,
    globalDailyTrades: 0,
    userLimit: 3,
    fyers: {
        appId: config.fyers.appId,
        secretId: config.fyers.secretId,
        redirectUrl: config.fyers.redirectUrl,
        callbackSecret: config.fyers.callbackSecret,
        apiUrl: config.fyers.apiUrl,
        dataApiUrl: config.fyers.dataApiUrl,
        webSocketUrl: config.fyers.webSocketUrl,
    },
    fyersTrueData: {
        username: config.fyersTrueData.username,
        password: config.fyersTrueData.password,
    },
    NSEApi: {
        NSEOptionQuoteDerivativeAPIUrl: config.NSEApi.NSEOptionQuoteDerivativeAPIUrl,
        NSEOptionChainDataAPIUrl: config.NSEApi.NSEOptionChainDataAPIUrl,
    },
    lastUpdated: new Date(),
}

export default async () =>
    new Promise(async (resolve, reject) => {
        Settings.create(settingsData)
            .then((data) => {
                logger.info("Settings created", false)
                return resolve({ status: "success", message: "Settings created" })
            })
            .catch((err) => {
                logger.warn("Settings already exists, So updating them", false)
                Settings.updateOne(settingsData)
                    .then((data) => {
                        logger.info("Settings updated", false)
                        return resolve({ status: "success", message: "Settings updated" })
                    })
                    .catch((err) => {
                        logger.error(err.message, false)
                        return reject({ status: "error", message: err.message })
                    })
            })
    })
