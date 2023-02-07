import { EventEmitter } from 'events'
import localDB from "../db/localdb"
import * as fyers from "../lib/fyers"
import logger from "../logger"
import { Session, User } from "../model"
import { generateSymbolStrikePrices } from './../manager/strikePrice.manager'
import marketDataUpdateHandler from './marketDataUpdate.handler'
import orderUpdateHandler from "./orderUpdate.handler"
const connectionToOrderUpdateSocket = new fyers.orderUpdateSocket()
const connectionToMarketDataSocket = new fyers.marketDataSocket()
let primaryAccessToken: string


export const subscribeToAllUsersSockets = async (chatter: EventEmitter) => {
    const users = await User.find()
    const activeUsersSocketConnection: Array<any> = []

    function connectSocket(user: any) {
        if (user.connectedApps.includes("fyers")) {
            logger.info("User connected to fyers " + user.email)
            fyers.getProfile(user.fyAccessToken).then(async (profile) => {
                if (profile.code === 200) {
                    if (user.email == "fisolatedx@gmail.com") primaryAccessToken = user.fyAccessToken
                    const userSession = await Session.findOne({ userId: user._id })
                    if (userSession) {
                        activeUsersSocketConnection.push(userSession.userId)
                        connectionToOrderUpdateSocket.onOrderUpdate(user.fyAccessToken, (data: any) => {
                            const letData = JSON.parse(data)
                            if (letData.s == "ok") {
                                orderUpdateHandler(userSession.userId, letData.d, chatter)
                                chatter.emit(userSession.userId, letData.d)
                            } else {
                                connectionToOrderUpdateSocket.unsubscribe()
                                activeUsersSocketConnection.splice(activeUsersSocketConnection.indexOf(userSession.userId), 1)
                                logger.info("Error in order update socket " + letData)
                            }
                        })
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
        connectionToMarketDataSocket.onMarketDataUpdate(data, primaryAccessToken, async (data: any) => {
            marketDataUpdateHandler(data, chatter)
        })
    })
    if (primaryAccessToken) {
        const symbol = [localDB.mainSymbol, localDB.secondarySymbol, ...localDB.o5BanksSymbol, ...localDB.t5BanksSymbol]
        const { symbolsArray, currentExpiry }: any = await generateSymbolStrikePrices("NIFTY BANK").catch((err) => {
            logger.error(err)
        })
        connectionToMarketDataSocket.onMarketDataUpdate([...symbol, ...symbolsArray[currentExpiry]], primaryAccessToken, async (data: any) => {
            marketDataUpdateHandler(data, chatter)
        })
    } else {
        setTimeout(() => {
            logger.info("Retrying to connect to market data socket")
            subscribeToMarketDataSocket(chatter)
        }, 10000)
    }
}