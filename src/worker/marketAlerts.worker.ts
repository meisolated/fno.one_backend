import chatter from "../events"
import { MarketAlerts } from "../model"
let marketAlerts: any = []
let symbolLTP: any = {}

export default () => {
    const getMarketAlerts = async () => {
        marketAlerts = await MarketAlerts.find({})
        return
    }
    chatter.on("symbolUpdateTicks-", "tick", (data) => {
        return (symbolLTP[data.symbol] = data.lp)
    })

    setInterval(async () => {
        await getMarketAlerts()
    }, 5000)

    setInterval(async () => {
        marketAlerts.forEach(async (alert: any) => {
            if (!alert.alerted) {
                if (alert.condition === "greaterThan") {
                    if (symbolLTP[alert.symbol] > alert.value) {
                        alert.alerted = true
                        await alert.save()
                        chatter.emit("marketAlerts-", alert.userId, {
                            status: "triggered",
                            symbol: alert.symbol,
                            condition: alert.condition,
                            value: alert.value,
                        })
                        console.log("alert triggered")
                        console.log(alert.symbol, alert.value, symbolLTP[alert.symbol])
                    }
                } else if (alert.condition === "lessThan") {
                    if (symbolLTP[alert.symbol] < alert.value) {
                        alert.alerted = true
                        await alert.save()
                        chatter.emit("marketAlerts-", alert.userId, {
                            status: "triggered",
                            symbol: alert.symbol,
                            condition: alert.condition,
                            value: alert.value,
                        })
                        console.log("alert triggered")
                        console.log(alert.symbol, alert.value, symbolLTP[alert.symbol])
                    }
                }
            }
        })
    }, 500)
}
