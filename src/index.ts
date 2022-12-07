import compression from "compression"
import cookieParser from "cookie-parser"
import express, { Express, json, Request, Response, urlencoded } from "express"
import http from "http"
import * as path from "path"
import { Server } from "socket.io"
import middleware from "./api/middleware"
import socketLoader from "./api/socket"
import config from "./config"
import chatter from "./events"
import initialize from "./initialize"
import * as fyers from "./lib/fyers"
import LoadRoutes from "./lib/routesLoader"
import logger from "./logger"
import { Session, User } from "./model"

const app: Express = express()
const server = http.createServer(app)
const port: number = config.port
const io = new Server(server)
const routesDirPath = path.join(__dirname, "/api/routes")
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
    for (const user of users) {
        if (user.connectedApps.includes("fyers")) {
            fyers.getProfile(user.fyAccessToken).then(async (profile) => {
                if (profile.code === 200) {
                    const userSession = await Session.findOne({ userId: user._id })
                    if (userSession) {
                        const connectionToOrderUpdateSocket = new fyers.orderUpdateSocket()
                        connectionToOrderUpdateSocket.onOrderUpdate(user.fyAccessToken, (data: any) => {
                            chatter.emit(userSession.userId, data)
                        })
                    }
                } else {
                    console.log("User disconnected from fyers", user.email)
                    user.connectedApps = user.connectedApps.filter((app) => app !== "fyers")
                    user.save()
                }
            })
        }
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
    // -----------| Starting server |-----------
    logger.info("Starting server...")
    server.listen(port, () => {
        logger.info(`Server started on port ${port}`)
    })
})
