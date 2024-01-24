import chatter from "../events"
import logger from "../logger"

let previousCandleData: any = {}
let marketMovementData: any = {}
const indexSymbols = ["NIFTY BANK", "NIFTY 50", "FINNIFTY"]
const indexOptionPrefix = ["BANKNIFTY", "NIFTY", "FINNIFTY"]
export default function () {
    logger.info("Starting market movement analyzer...", "MarketMovementAnalyzer")
    chatter.on("candleStickUpdate-", "5min", (data: any) => {
        const difference = (data.close - data.open).toFixed(2)
        chatter.emit("marketMovementUpdate-", "5min", {
            symbol: data.symbol,
            difference,
        })
    })

}