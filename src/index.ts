import compression from "compression"
import cookieParser from "cookie-parser"
import express, { Express, json, Request, Response, urlencoded } from "express"
import http from "http"
import * as path from "path"
import { Server } from "socket.io"
import config from "./config"
import initialize from "./initialize"
import LoadRoutes from "./lib/routesLoader"
import logger from "./logger"
import middleware from "./middleware"
import socketLoader from "./socket"

const app: Express = express()
const server = http.createServer(app)
const port: number = config.port
const io = new Server(server)
const routesDirPath = path.join(__dirname, "/routes")
const configDir = path.join(__dirname, "/config/index.json")
app.use(compression({ level: 9 }))
app.use(middleware)
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))
app.use(cookieParser())

app.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Something is missing over here", code: 200 })
})
// ------------| Loading Routes |------------
logger.info("Loading routes...")
LoadRoutes(app, routesDirPath, "", true).then(async () => {
    logger.info("Routes loaded!")
    // -----------| Initializing Socket |-----------
    logger.info("Loading socket.io events...")
    socketLoader(io)
    logger.info("Socket.io events loaded!")
    // ---------| Initialize server config |-----------
    await initialize(configDir)
    // -----------| Starting server |-----------
    logger.info("Starting server...")
    server.listen(port, () => {
        logger.info(`Server started on port ${port}`)
    })
})
