import { MarketAlters } from "../model"
import chatter from "./index"
let marketAlerts: any = []
let symbolLTP: any = {}

export default () => {
    console.log("Market alerts started")
    const getMarketAlerts = async () => {
        marketAlerts = await MarketAlters.find({})
        return
    }
    chatter.on("symbolUpdateTicks-", "tick", (data) => {
        return (symbolLTP[data.symbol] = data.lp)
    })

    setInterval(async () => {
        await getMarketAlerts()
        marketAlerts.forEach(async (alert: any) => {
            if (!alert.alerted) {
                if (alert.condition === "greaterThan") {
                    if (symbolLTP[alert.symbol] > alert.value) {
                        alert.alerted = true
                        await alert.save()
                        chatter.emit("marketAlerts-", alert.userId, alert)
                        console.log(alert)
                    }
                } else if (alert.condition === "lessThan") {
                    if (symbolLTP[alert.symbol] < alert.value) {
                        alert.alerted = true
                        await alert.save()
                        chatter.emit("marketAlerts-", alert.userId, alert)
                        console.log(alert)
                    }
                }
            }
        })
    }, 1000)
}
