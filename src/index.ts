import compression from "compression"
import express, { Express, json, Request, Response, urlencoded } from "express"
import http from "http"
import * as path from "path"
import { Server } from "socket.io"
import config from "./config"
import LoadRoutes from "./lib/routesLoader"
import logger from "./logger"
import middleware from "./middleware"

const app: Express = express()
const server = http.createServer(app)
const port: number = config.port
const io = new Server(server)
const routesDirPath = path.join(__dirname, "/routes")
app.use(compression({ level: 9 }))
app.use(middleware)
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Something is missing over here", code: 200 })
})
logger.log("Loading routes...")
LoadRoutes(app, routesDirPath, "", true).then(() => {
    logger.log("Routes loaded!")
    logger.log("Loading socket.io events...")
    io.on("connection", (socket) => {
        logger.log("New client connected")
        if (!socket.handshake.query.key) {
            socket.disconnect()
        }
        socket.on("disconnect", () => {
            logger.log("user disconnected")
        })
    })
    logger.log("Socket.io events loaded!")
    logger.log("Starting server...")

    server.listen(port, () => {
        logger.log(`Server started on port ${port}`)
    })
})
