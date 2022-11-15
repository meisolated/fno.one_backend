import config from "../config"
import db from "../db/localdb"
import logger from "../logger"
import { Settings } from "./"

export default async () =>
    new Promise(async (resolve, reject) => {
        Settings.create({
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
                apiUrl: db.apiUrl,
                dataApiUrl: db.dataApiUrl,
                webSocketUrl: db.webSocketUrl,
            },
            NSEApi: {
                NSEOptionQuoteDerivativeAPIUrl: db.NSEOptionQuoteDerivativeAPIUrl,
                NSEOptionChainDataAPIUrl: db.NSEOptionChainDataAPIUrl,
            },
            lastUpdated: new Date(),
        })
            .then((data) => {
                logger.info("Settings created", false)
                return resolve({ status: "success", message: "Settings created" })
            })
            .catch((err) => {
                logger.error(err.message, false)
                return resolve({ status: "success", message: "Settings already exists" })
                // // Update Settings in this case
                // Settings.updateOne({
                //     id: 1,
                //     realTimeMarketsToWatch: [
                //         "NSE:NIFTYBANK-INDEX",
                //         "NSE:NIFTY50-INDEX",
                //         "NSE:HDFCBANK-EQ",
                //         "NSE:SBIN-EQ",
                //         "NSE:ICICIBANK-EQ",
                //         "NSE:KOTAKBANK-EQ",
                //         "NSE:AXISBANK-EQ",
                //         "NSE:INDUSINDBK-EQ",
                //         "NSE:AUBANK-EQ",
                //         "NSE:BANKBARODA-EQ",
                //         "NSE:FEDERALBNK-EQ",
                //         "NSE:BANDHANBNK-EQ",
                //     ],
                //     keepRealTimeMarketsData: true,
                //     keepRealTimeMarketsDataFor: 30,
                //     globalStopLoss: 5,
                //     globalTakeProfit: 10,
                //     globalDailyTrades: 0,
                //     userLimit: 3,
                //     fyers: {
                //         appId: config.fyers.appId,
                //         secretId: config.fyers.secretId,
                //         redirect: config.fyers.redirect,
                //         callbackSecret: config.fyers.callbackSecret,
                //         apiUrl: db.apiUrl,
                //         dataApiUrl: db.dataApiUrl,
                //         webSocketUrl: db.webSocketUrl,
                //     },
                //     NSEApi: {
                //         NSEOptionQuoteDerivativeAPIUrl: db.NSEOptionQuoteDerivativeAPIUrl,
                //         NSEOptionChainDataAPIUrl: db.NSEOptionChainDataAPIUrl,
                //     },
                //     lastUpdated: new Date(),
                // }).then((data) => {
                //     logger.info("Settings updated", false)
                //     return resolve({ status: "success", message: "Settings updated" })
                // }).catch((err) => {
                //     logger.error(err.message, false)
                //     return reject({ status: "error", message: err.message })
                // })
            })
    })
