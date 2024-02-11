import moment from "moment"
import { HistoricalData } from "../model"

interface candle {
    h: number
    l: number
    o: number
    c: number
    t: number
}

const getLast12MonthsUnixTimestamps = () => {
    const twelveMonthsUnix = moment().subtract(12, "months").unix()
    const now = moment().unix()
    return { twelveMonthsUnix, now }
}

const breakoutStrategyBacktest = async () => {
    try {
        const { twelveMonthsUnix, now } = getLast12MonthsUnixTimestamps()
        const candleData = await HistoricalData.find({
            symbol: "NSE:NIFTYBANK-INDEX",
            resolution: "5",
            t: { $gte: twelveMonthsUnix, $lte: now },
        }).lean()

        if (candleData.length === 0) return console.log("No data found")


        for (let i = 0; i < candleData.length; i++) {
            const currentCandle: candle = candleData[i]
            const getHoursInIST = new Date(currentCandle.t * 1000).getHours()
            const getMinutesInIST = new Date(currentCandle.t * 1000).getMinutes()
            const day = new Date(currentCandle.t * 1000).getDay()

            /**
             * check the candle closing price of 3:30 PM
             * then get the next candle opening price of 9:15 AM
             * if the difference of both candles is more than 500 points then if it's positive then buy and if it's negative then sell
             * 
             */

            if (getHoursInIST === 15 && getMinutesInIST === 25) {
                const currentCandleClosingPrice = currentCandle.c
                const nextCandleOpeningPrice = candleData[i + 1].o
                const difference = nextCandleOpeningPrice - currentCandleClosingPrice

            }



            if (candleData.length - 1 === i) {
            }
        }
    } catch (err) {
        console.error("Error during backtest:", err)
    } finally {
        console.log("Backtest completed")
    }
}

breakoutStrategyBacktest()
