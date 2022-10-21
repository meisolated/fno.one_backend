import express, { Express, json, Request, Response, urlencoded } from "express"
import config from "./config"
import fyersHandler from "./handler/fyers.handler"

const app: Express = express()
const port: number = config.port
const fyers = new fyersHandler()

app.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Something is missing over here", code: 200 })
})
app.get("/accept_access", async (_req: Request, res: Response) => {
    console.log(_req.query)
    if (_req.query.auth_code) {
        const accessToken = await fyers.generateAccessToken(_req.query.auth_code)
        fyers.setAccessToken(accessToken.access_token)
        const up = await fyers.getUserProfile()
        await fyers.connectToWebSocket()
        const tb = await fyers.getTradeBook()
        console.log(tb)
        console.log(up)
        fyers.getHistory()
    }
    res.send({ message: "Something is missing over here", code: 200 })
})

app.listen(port, () => {
    console.log(`Server running on port http://localhost:` + port)
})
