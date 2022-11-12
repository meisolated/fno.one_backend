import express, { Express, json, Request, Response, urlencoded } from "express"
import http from "http"
import * as path from "path"
import { Server } from "socket.io"
import config from "./config"
import LoadRoutes from "./lib/routesLoader"

const app: Express = express()
const server = http.createServer(app)
const port: number = config.port
const io = new Server(server)
const routesDirPath = path.join(__dirname, "/routes")

app.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Something is missing over here", code: 200 })
})
console.log("Loading routes...")
LoadRoutes(app, routesDirPath, "", true).then(() => {
    console.log("Routes loaded!")
    console.log("Loading socket.io events...")
    io.on("connection", (socket) => {
        console.log("New client connected")
        if (!socket.handshake.query.key) {
            socket.disconnect()
        }
        console.log()
        socket.on("disconnect", () => {
            console.log("user disconnected")
        })
    })
    console.log("Socket.io events loaded!")
    console.log("Starting server...")

    server.listen(port, () => {
        console.log(`Socket running on port http://localhost:` + port)
    })
})
