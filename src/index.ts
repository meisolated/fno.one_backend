import compression from "compression"
import cookieParser from "cookie-parser"
import express, { Express, json, Request, Response, urlencoded } from "express"
import { subscribeToAllUsersSockets, subscribeToMarketDataSocket } from "handler/fyers.handler"
import http from "http"
import * as path from "path"
import { Server } from "socket.io"
import middleware from "./api/middleware"
import socketLoader from "./api/socket"
import config from "./config"
import localDB from "./db/localdb"
import chatter from "./events"
import marketDataUpdateHandler from "./handler/marketDataUpdate.handler"
import orderUpdateHandler from "./handler/orderUpdate.handler"
import initialize from "./initialize"
import * as fyers from "./lib/fyers"
import LoadRoutes from "./lib/routesLoader"
import logger from "./logger"
import { generateSymbolStrikePrices } from './manager/strikePrice.manager'
import { Session, User } from "./model"

const app: Express = express()
const server = http.createServer(app)
const APIport: number = config.APIPort
const socketPort: number = config.socketPort
const io = new Server(socketPort)
const routesDirPath = path.join(__dirname, "/api/routes")

// -------------
let primaryAccessToken: string
const connectionToOrderUpdateSocket = new fyers.orderUpdateSocket()
const connectionToMarketDataSocket = new fyers.marketDataSocket()
// -------------

app.use(compression({ level: 9 }))
app.use(middleware)
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))
app.use(cookieParser())
app.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Something is missing over here", code: 200 })
})

// const subscribeToAllUsersSockets = async () => {
//     const users = await User.find()
//     const activeUsersSocketConnection: Array<any> = []

//     function connectSocket(user: any) {
//         if (user.connectedApps.includes("fyers")) {
//             logger.info("User connected to fyers " + user.email)
//             fyers.getProfile(user.fyAccessToken).then(async (profile) => {
//                 if (profile.code === 200) {
//                     if (user.email == "fisolatedx@gmail.com") primaryAccessToken = user.fyAccessToken
//                     const userSession = await Session.findOne({ userId: user._id })
//                     if (userSession) {
//                         activeUsersSocketConnection.push(userSession.userId)
//                         connectionToOrderUpdateSocket.onOrderUpdate(user.fyAccessToken, (data: any) => {
//                             const letData = JSON.parse(data)
//                             if (letData.s == "ok") {
//                                 orderUpdateHandler(userSession.userId, letData.d, chatter)
//                                 chatter.emit(userSession.userId, letData.d)
//                             } else {
//                                 connectionToOrderUpdateSocket.unsubscribe()
//                                 activeUsersSocketConnection.splice(activeUsersSocketConnection.indexOf(userSession.userId), 1)
//                                 logger.info("Error in order update socket " + letData)
//                             }
//                         })
//                     }
//                 } else {
//                     logger.info("User disconnected from fyers " + user.email)
//                     user.connectedApps = user.connectedApps.filter((app: any) => app !== "fyers")
//                     user.save()
//                 }
//             })
//         }
//     }
//     for (const user of users) {
//         connectSocket(user)
//     }
//     setInterval(async () => {
//         const users = await User.find()
//         for (const user of users) {
//             const userIDString = user._id.toString()
//             if (!activeUsersSocketConnection.includes(userIDString)) {
//                 connectSocket(user)
//             }
//         }
//     }, 10000)
// }

// const subscribeToMarketDataSocket = async () => {
//     chatter.on("symbolUpdate", async (data: any) => {
//         connectionToMarketDataSocket.unsubscribe()
//         connectionToMarketDataSocket.onMarketDataUpdate(data, primaryAccessToken, async (data: any) => {
//             marketDataUpdateHandler(data, chatter)
//         })
//     })
//     if (primaryAccessToken) {
//         const symbol = [localDB.mainSymbol, localDB.secondarySymbol, ...localDB.o5BanksSymbol, ...localDB.t5BanksSymbol]
//         const { symbolsArray, currentExpiry }: any = await generateSymbolStrikePrices("NIFTY BANK").catch((err) => {
//             logger.error(err)
//         })
//         connectionToMarketDataSocket.onMarketDataUpdate([...symbol, ...symbolsArray[currentExpiry]], primaryAccessToken, async (data: any) => {
//             marketDataUpdateHandler(data, chatter)
//         })
//     } else {
//         setTimeout(() => {
//             logger.info("Retrying to connect to market data socket")
//             subscribeToMarketDataSocket()
//         }, 10000)
//     }
// }

chatter.on("marketDataUpdate", async (data: any) => {
    console.log(data)
})
chatter.on("orderUpdate", async (data: any) => {
    // console.log(data)
})
// ------------| Loading Routes |------------
logger.info("Loading routes...")
LoadRoutes(app, routesDirPath, "", true).then(async () => {
    logger.info("Routes loaded!")
    // -----------| Initializing Socket |-----------
    logger.info("Loading socket.io events...")
    socketLoader(io, chatter)
    logger.info("Socket.io events loaded!")
    // ---------| Initialize server config |-----------
    // await initialize() //!Removed as we don't need to initialize server config
    // ----------| Subscribe to all users sockets |----------
    subscribeToAllUsersSockets(chatter)
    // ----------| Subscribe to market data socket |----------
    subscribeToMarketDataSocket(chatter)
    // -----------| Starting server |-----------
    logger.info("Starting server...")
    server.listen(APIport, () => {
        logger.info(`Server started on port ${APIport}`)
    })
})
