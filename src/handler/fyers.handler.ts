import moment from "moment"
import config from "../config"
import chatter from "../events/eventEmitter"
import fyers from "../lib/fyers"
import { MarketData } from "../model"
import { user, User } from "./user.handler"

export default class fyersHandler {
    private appId: string = config.fyers.appId
    private redirect: string = config.fyers.redirect
    private fyers: any
    user: user
    constructor() {
        this.user = new User()
        this.fyers = fyers
        this.fyers.setAppId(this.appId)
        this.fyers.setRedirectUrl(this.redirect)
    }
    setAccessToken(token: any) {
        if (!token) return console.log("Invalid token")
        this.fyers.setAccessToken(token)
    }
    generateLoginUrl() {
        return this.fyers.generateAuthCode()
    }
    async generateAccessToken(authCode: any) {
        const req = { auth_code: authCode, secret_key: config.fyers.secretId }
        const res = await this.fyers.generate_access_token(req)
        return res
    }
    async getUserProfile() {
        const res = await this.fyers.get_profile()
        return res
    }
    async getTradeBook() {
        const tradebook = await this.fyers.get_tradebook()
        return tradebook
    }
    async marketDataConnectSocket() {
        chatter.on("marketDataSymbolUpdate", (symbols: Array<string>) => {
            this.fyers.fyers_unsubscribe()
            const reqBody = { symbols, dataType: "symbolUpdate" }
            this.fyers.fyers_connect(reqBody, (res: any) => {
                const data = JSON.parse(res)
                if (data.s == "ok") {
                    data.d["7208"].forEach((e: any) => {
                        // TODO: Maybe we will use it some other time
                        // MarketData.create(e.v)
                        chatter.emit("symbolMarketDataUpdate", e.v)
                    })
                }
            })
        })
        const reqBody = {
            symbol: [
                "NSE:HDFCBANK-EQ",
                "NSE:SBIN-EQ",
                "NSE:ICICIBANK-EQ",
                "NSE:KOTAKBANK-EQ",
                "NSE:AXISBANK-EQ",
                "NSE:INDUSINDBK-EQ",
                "NSE:AUBANK-EQ",
                "NSE:BANKBARODA-EQ",
                "NSE:FEDERALBNK-EQ",
                "NSE:BANDHANBNK-EQ",
                "NSE:NIFTYBANK-INDEX",
            ],
            dataType: "symbolUpdate",
        }
    }

    async getHistory() {
        let from: any = new Date(2022, 1, 1)
        from = moment(from)
        from = from.unix()
        let to = moment().format("X")
        let history = new this.fyers.history()
        let result = await history
            .setSymbol("NSE:HDFCBANK-EQ")
            .setResolution("D")
            .setDateFormat(0)
            .setRangeFrom(from)
            .setRangeTo(to)
            .getHistory()
        console.log(result)
    }
}
