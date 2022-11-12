import express, { Express, json, Request, Response, urlencoded } from "express"
import http from "http"
import { Server } from "socket.io"
import config from "./config"
import fyersHandler from "./handler/fyers.handler"

const app: Express = express()
const server = http.createServer(app)
const port: number = config.port
const fyers = new fyersHandler()
const io = new Server(server)

var tempStorage: any = {}

app.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Something is missing over here", code: 200 })
})
app.get("/accept_access", async (req: Request, res: Response) => {
    console.log(req.query)
    if (req.query.auth_code) {
        const accessToken = await fyers.generateAccessToken(req.query.auth_code)
        fyers.setAccessToken(accessToken.access_token)
        await fyers.connectToMarketDataSocket()
        await fyers.connectToOrderSocket()
        const randomString = Math.random().toString(36).substring(7)
        res.cookie("temp_token", randomString)
        tempStorage[randomString] = accessToken.access_token
        return res.send({ message: "Access token generated", code: 200 })
    } else {
        res.send({ message: "Invalid data", code: 200 })
    }
})
app.get("/place_test_order", async (_req: Request, res: Response) => {
    const order = await fyers.placeTestOrder()
    res.send(order)
})

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


server.listen(port, () => {
    console.log(`Socket running on port http://localhost:` + port)
})



