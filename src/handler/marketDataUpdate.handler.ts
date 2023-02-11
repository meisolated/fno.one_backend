import { EventEmitter } from "events"
import logger from "../logger"
import { MarketData } from "../model"
export default async function (data: any, chatter: EventEmitter) {
    if (typeof data == "undefined") return logger.warn("Undefined data in market data socket")
    if (data.s == "ok") {
        if (data.d["7208"].length > 0) {
            const marketDataArray = data.d["7208"]
            marketDataArray.forEach((marketData: any) => {
                chatter.emit("marketDataUpdate", marketData.v)
                MarketData.insertMany(marketData.v).catch((err) => {
                    logger.error(err)
                })
            })
        }
    } else {
        const parsedData = JSON.parse(data)
        if (parsedData.s == "error") {
            logger.error("Error in market data socket " + parsedData)
        }
    }
}
