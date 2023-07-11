import config from "../config"
import chatter from "../events"
import * as fyers from "../lib/fyers"
import trueData from "../lib/trueData"
import logger from "../logger"
import { Session, User } from "../model"
import marketDataUpdateHandler from "./marketDataUpdate.handler"
import orderUpdateHandler from "./orderUpdate.handler"
const connectionToOrderUpdateSocket = new fyers.orderUpdateSocket()
const connectionToMarketDataSocket = new fyers.marketDataSocket()

let primaryAccessToken: AccessToken = {
    accessToken: "",
    email: "",
}
export const subscribeToAllUsersSockets = async () => {
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
                                    orderUpdateHandler(userSession.userId, letData.d)
                                    chatter.emit("fyersOrderUpdateSocket-", userSession.userId, letData.d)
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

export const subscribeToMarketDataSocket = async () => {
    if (config.serverSettings.enableFyersMarketDataSocket) {
        connectFyersMarketDataSocket() // connect to fyers market data socket
    }
    if (config.serverSettings.enableTrueDataMarketDataSocket) {
        connectTrueDataMarketDataSocket() // connect to true data market data socket
    }
}

const connectFyersMarketDataSocket = async () => {
    async function connectToSocket() {
        if (primaryAccessToken.accessToken != "" && primaryAccessToken.email != "") {
            const symbol = [config.mainSymbol, config.secondarySymbol, ...config.o5BanksSymbol, ...config.t5BanksSymbol]
            connectionToMarketDataSocket.onMarketDataUpdate(
                [...symbol],
                primaryAccessToken.accessToken,
                async (data: any) => {
                    marketDataUpdateHandler(data)
                },
                primaryAccessToken.email
            )
        } else {
            retry()
        }
    }
    connectToSocket()
    function retry() {
        setTimeout(() => {
            logger.warn("Retrying to connect to market data socket")
            connectToSocket()
        }, 10000)
    }
}

const connectTrueDataMarketDataSocket = async () => {
    try {
        const trueDataConnection = new trueData.MarketFeeds(config.trueData.username, config.trueData.password, ["NIFTY BANK"], "live", true, false)
        chatter.on("trueDataLibMarketDataUpdates-", "askReconnect", async (data: any) => {
            trueDataConnection.closeConnection()
            trueDataConnection.connect()
        })
    } catch (err: any) {
        logger.error("Error in connecting to true data socket", false, "", "trueData")
    }
}
