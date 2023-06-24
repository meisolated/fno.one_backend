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
import { subscribeToAllUsersSockets, subscribeToMarketDataSocket } from "./handler/fyers.handler"
import LoadRoutes from "./lib/routesLoader"
import TrueData from "./lib/trueData"
import logger from "./logger"
// import { updateOpenInterests } from "./manager/oi.manager"

const app: Express = express()
const server = http.createServer(app)
const APIport: number = config.APIPort
const socketPort: number = config.socketPort
const io = new Server(socketPort)
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

chatter.on("fyersMarketDataUpdates-", "marketDataUpdate", async (data: any) => {
    // console.log(data)
})
chatter.on("fyersOrderHandler-", "orderUpdate", async (data: any) => {
    // console.log(data)
})
// ------------| Loading Routes |------------
logger.info("Loading routes...")
LoadRoutes(app, routesDirPath, "", true).then(async () => {
    logger.info("Routes loaded!")
    // -----------| Initializing Socket |-----------
    logger.info("Loading socket.io events...")
    socketLoader(io)
    logger.info("Socket.io events loaded!")
    // ----------| Subscribe to all users sockets |----------
    subscribeToAllUsersSockets()
    // ----------| Subscribe to market data socket |----------
    subscribeToMarketDataSocket()


    //--------------------------------------------------------------------------------
    //currently not using this as its not the right way to do it
    // ----------| Updating open Interest |----------
    // await updateOpenInterests()
    // -----------| Starting server |-----------
    //--------------------------------------------------------------------------------

    logger.info("Starting server...")

    server.listen(APIport, () => {
        logger.info(`Server started on port ${APIport}`)
    })
})
