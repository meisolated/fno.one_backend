import express, { Express, json, Request, Response, urlencoded } from "express"
import config from "./config"
import fyersHandler from "./handler/fyers.handler"

const app: Express = express()
const port: number = config.port
const fyers = new fyersHandler()

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
        return res.send({ message: "Access token generated", code: 200 })
    } else {
        res.send({ message: "Something is missing over here", code: 200 })
    }
})

app.listen(port, () => {
    console.log(`Server running on port http://localhost:` + port)
})

// setInterval(async () => {
//     if (fyers.user.loggedIn) {

//     }
// }, 1000)
