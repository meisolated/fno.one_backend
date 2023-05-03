import { EventEmitter } from "events"
import localDB from "../db/localdb"
import * as fyers from "../lib/fyers"
import logger from "../logger"
import { Session, User } from "../model"
import { generateSymbolStrikePrices } from "./../manager/strikePrice.manager"
import marketDataUpdateHandler from "./marketDataUpdate.handler"
import orderUpdateHandler from "./orderUpdate.handler"
const connectionToOrderUpdateSocket = new fyers.orderUpdateSocket()
const connectionToMarketDataSocket = new fyers.marketDataSocket()

interface AccessToken {
    accessToken: string
    email: string
}
let primaryAccessToken: AccessToken = {
    accessToken: "",
    email: "",
}
export const subscribeToAllUsersSockets = async (chatter: EventEmitter) => {
    const users = await User.find()
    const activeUsersSocketConnection: Array<any> = []

    function connectSocket(user: any) {
        if (user.connectedApps.includes("fyers")) {
            logger.info("We were able to connect this user to fyers api with access token " + user.email)
            fyers.getProfile(user.userAppsData.fyers.accessToken).then(async (profile) => {
                if (profile.code === 200) {
                    if (user.roles.includes("admin")) {
                        primaryAccessToken.accessToken = user.userAppsData.fyers.accessToken
                        primaryAccessToken.email = user.email
                    }
                    const userSession = await Session.findOne({ userId: user._id })
                    if (userSession) {
                        activeUsersSocketConnection.push(userSession.userId)
                        connectionToOrderUpdateSocket.onOrderUpdate(
                            user.userAppsData.fyers.accessToken,
                            (data: any) => {
                                const letData = JSON.parse(data)
                                if (letData.s == "ok") {
                                    orderUpdateHandler(userSession.userId, letData.d, chatter)
                                    chatter.emit(userSession.userId, letData.d)
                                } else {
                                    connectionToOrderUpdateSocket.unsubscribe()
                                    activeUsersSocketConnection.splice(activeUsersSocketConnection.indexOf(userSession.userId), 1)
                                    logger.error("Error in order update socket " + letData)
                                }
                            },
                            primaryAccessToken.email
                        )
                    }
                } else {
                    logger.info("User disconnected from fyers " + user.email)
                    user.connectedApps = user.connectedApps.filter((app: any) => app !== "fyers")
                    user.save()
                }
            })
        }
    }
    for (const user of users) {
        connectSocket(user)
    }
    setInterval(async () => {
        const users = await User.find()
        for (const user of users) {
            const userIDString = user._id.toString()
            if (!activeUsersSocketConnection.includes(userIDString)) {
                connectSocket(user)
            }
        }
    }, 10000)
}
export const subscribeToMarketDataSocket = async (chatter: EventEmitter) => {
    chatter.on("symbolUpdate", async (data: any) => {
        connectionToMarketDataSocket.unsubscribe()
        connectionToMarketDataSocket.onMarketDataUpdate(
            data,
            primaryAccessToken.accessToken,
            async (data: any) => {
                marketDataUpdateHandler(data, chatter)
            },
            primaryAccessToken.email
        )
    })
    if (primaryAccessToken.accessToken != "" && primaryAccessToken.email != "") {
        const symbol = [localDB.mainSymbol, localDB.secondarySymbol, ...localDB.o5BanksSymbol, ...localDB.t5BanksSymbol]
        const strikePrices: any = await generateSymbolStrikePrices("NSE:NIFTYBANK-INDEX")
        if (!strikePrices) return retry()
        connectionToMarketDataSocket.onMarketDataUpdate(
            [...symbol, ...strikePrices.symbolsArray[strikePrices.currentExpiry]],
            primaryAccessToken.accessToken,
            async (data: any) => {
                marketDataUpdateHandler(data, chatter)
            },
            primaryAccessToken.email
        )
    } else {
        retry()
    }
    function retry() {
        setTimeout(() => {
            logger.warn("Retrying to connect to market data socket")
            subscribeToMarketDataSocket(chatter)
        }, 10000)
    }
}
