import compression from "compression"
import cookieParser from "cookie-parser"
import express, { Express, json, Request, Response, urlencoded } from "express"
import http from "http"
import * as path from "path"
import { Server } from "socket.io"
import middleware from "./api/middleware"
import socketLoader from "./api/socket"
import config from "./config"
import localDB from "./db/localdb"
import chatter from "./events"
import orderUpdateHandler from "./handler/orderUpdate.handler"
import initialize from "./initialize"
import * as fyers from "./lib/fyers"
import LoadRoutes from "./lib/routesLoader"
import logger from "./logger"
import { Session, User } from "./model"

const app: Express = express()
const server = http.createServer(app)
const APIport: number = config.APIPort
const socketPort: number = config.socketPort
const io = new Server(socketPort)
const routesDirPath = path.join(__dirname, "/api/routes")

let primaryAccessToken: string
const connectionToOrderUpdateSocket = new fyers.orderUpdateSocket()
const connectionToMarketDataSocket = new fyers.marketDataSocket()

app.use(compression({ level: 9 }))
app.use(middleware)
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))
app.use(cookieParser())
app.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Something is missing over here", code: 200 })
})


const subscribeToAllUsersSockets = async () => {
    const users = await User.find()
    const activeUsersSocketConnection: Array<String> = []
    for (const user of users) {
        if (user.connectedApps.includes("fyers")) {
            logger.info("User connected to fyers " + user.email)
            fyers.getProfile(user.fyAccessToken).then(async (profile) => {
                if (profile.code === 200) {
                    if (user.email == "fisolatedx@gmail.com") primaryAccessToken = user.fyAccessToken // -------
                    const userSession = await Session.findOne({ userId: user._id })
                    if (userSession) {
                        activeUsersSocketConnection.push(userSession.userId)

                        connectionToOrderUpdateSocket.onOrderUpdate(user.fyAccessToken, (data: any) => {
                            const letData = JSON.parse(data)
                            if (letData.s == "ok") {
                                orderUpdateHandler(userSession.userId, letData.d, chatter)
                                chatter.emit(userSession.userId, letData.d)
                            }
                            else {
                                logger.info("Error in order update socket " + letData)
                            }
                        })
                    }
                } else {
                    logger.info("User disconnected from fyers " + user.email)
                    user.connectedApps = user.connectedApps.filter((app) => app !== "fyers")
                    user.save()
                }
            })
        }
    }
}

const subscribeToMarketDataSocket = async () => {
    chatter.on("symbolUpdate", async (data: any) => {

    })
    if (primaryAccessToken) {
        const symbol = ["NSE:NIFTYBANK-INDEX"]
        connectionToMarketDataSocket.onMarketDataUpdate(symbol, primaryAccessToken, async (data: any) => {
            console.log(data)
        })
    }
    else {
        setTimeout(() => {
            logger.info("Retrying to connect to market data socket")
            subscribeToMarketDataSocket()
        }, 10000)
    }

}

// ------------| Loading Routes |------------
logger.info("Loading routes...")
LoadRoutes(app, routesDirPath, "", true).then(async () => {
    logger.info("Routes loaded!")
    // -----------| Initializing Socket |-----------
    logger.info("Loading socket.io events...")
    socketLoader(io, chatter)
    logger.info("Socket.io events loaded!")
    // ---------| Initialize server config |-----------
    await initialize()
    // ----------| Subscribe to all users sockets |----------
    subscribeToAllUsersSockets()
    // ----------| Subscribe to market data socket |----------
    subscribeToMarketDataSocket()
    // -----------| Starting server |-----------
    logger.info("Starting server...")
    server.listen(APIport, () => {
        logger.info(`Server started on port ${APIport}`)
    })
})

