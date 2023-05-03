import axios from "axios"

const appId = "6UL65YECYS-100"
const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NzkzNzgwOTMsImV4cCI6MTY3OTQ0NTA1MywibmJmIjoxNjc5Mzc4MDkzLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCa0dVYXQ5YUxaVElWR01ONDJtMWZwV3NGQ0YzeFRDNUZGclM5cE9NSjJwVDRQVk9fTExUMnAzbUhnbUV2MDktd19lMkoyaDM2Z1M1YmEtLTlnVVVQNEpsOEdVTV9YN0RDRktVSl9pZTZqcXYzMEQzST0iLCJkaXNwbGF5X25hbWUiOiJWSVZFSyBLVU1BUiBNVURHQUwiLCJvbXMiOiJLMSIsImZ5X2lkIjoiWFYxOTgxOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.EIKy_LKpImSRayDMSzfdMHjstvH3kUE35IHvNW4yHvM"

const symbol = "NSE:NIFTYBANK-INDEX"
const lastYearUnixTime = new Date().getTime() - 365 * 24 * 60 * 60 * 1000
const resolution = "1"
const dateFormat = 0

// Analyze the data

const lastOneYearMontlyTimestampGenerator = () => {
    const lastOneYearMontlyTimestamp = []
    for (let i = 0; i < 12; i++) {
        const unix = Math.floor((lastYearUnixTime + i * 30 * 24 * 60 * 60 * 1000) / 1000)
        const date = new Date(unix)
        const trimmedDate = date.toISOString().split("T")[0]
        lastOneYearMontlyTimestamp.push(unix)
    }
    return lastOneYearMontlyTimestamp
}
const monthOnMonth = lastOneYearMontlyTimestampGenerator()

const convertMonthOnMonthToPair = (monthOnMonth: number[]) => {
    const monthOnMonthPair = []
    for (let i = 0; i < monthOnMonth.length - 1; i++) {
        monthOnMonthPair.push([monthOnMonth[i], monthOnMonth[i + 1]])
    }
    return monthOnMonthPair
}
const monthOnMonthPair = convertMonthOnMonthToPair(monthOnMonth)

// sleep for 2 sec
const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// setup settings
const dailyAllowedTrades = 3
const maxSL = 40
const targetRatio = 3

// setup data
let totalNumberOfTradesOfTheDay = 0
let yesterdayDate = ""
let lastCandleData = {
    open: 0,
    close: 0,
    high: 0,
    low: 0,
}
const activeTrade = {
    breakoutRange: [0, 0],
    breakoutSide: "nill",
    status: false,
    tradeActive: false,
    stoploss: 0,
    target: 0,
    entryPrice: 0,
    SLInPoints: 0,
}
let totalSL = 0
let totalTarget = 0
let pointsCaptured = 0
let todayPointsCaptured = 0
let totalPostiveDays = 0
let totalNegativeDays = 0

async function asyncForEach(monthsUnixPair: Array<Array<number>>, callback: Function) {
    for (let index = 0; index < monthsUnixPair.length; index++) {
        var config = {
            method: "get",
            url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${monthsUnixPair[index][0]}&range_to=${monthsUnixPair[index][1]}&cont_flag=`,
            // url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${from}&range_to=${to}&cont_flag=`,
            headers: {
                Authorization: appId + ":" + accessToken,
            },
        }

        await sleep(2000)
        const { data }: any = await axios(config).catch((error) => {
            console.log(error)
        })
        const candles: Array<[number]> = data.candles
        candles.forEach((candle: Array<number>, index) => {
            const ts = candle[0]
            const open = candle[1]
            const high = candle[2]
            const low = candle[3]
            const close = candle[4]
            const volume = candle[5]
            const thisCandleDate = new Date(ts * 1000).toISOString().split("T")[0]

            // ignore first candle if day is different
            if (thisCandleDate !== yesterdayDate) {
                yesterdayDate = thisCandleDate
                totalNumberOfTradesOfTheDay = 0
                lastCandleData = {
                    open: 0,
                    close: 0,
                    high: 0,
                    low: 0,
                }
                activeTrade.breakoutRange = [0, 0]
                activeTrade.breakoutSide = "nill"
                activeTrade.status = false
                activeTrade.tradeActive = false
                activeTrade.stoploss = 0
                activeTrade.target = 0
                activeTrade.entryPrice = 0
                activeTrade.SLInPoints = 0
                if (todayPointsCaptured > 0) {
                    totalPostiveDays++
                } else {
                    totalNegativeDays++
                }
                todayPointsCaptured = 0
            } else {
                if (thisCandleDate == yesterdayDate) {
                    if (lastCandleData.close == 0 && lastCandleData.open == 0) {
                        return
                    } else {
                        if (activeTrade.status) {
                            if (activeTrade.tradeActive) {
                                if (close < activeTrade.stoploss) {
                                    activeTrade.tradeActive = false
                                    activeTrade.status = false
                                    pointsCaptured -= activeTrade.SLInPoints
                                    totalNumberOfTradesOfTheDay++
                                    todayPointsCaptured += pointsCaptured
                                    totalSL++
                                } else if (close > activeTrade.target) {
                                    activeTrade.tradeActive = false
                                    activeTrade.status = false
                                    pointsCaptured += activeTrade.SLInPoints * targetRatio
                                    totalTarget++
                                    todayPointsCaptured += pointsCaptured
                                    totalNumberOfTradesOfTheDay++
                                }
                                if (activeTrade.breakoutSide == "buy") {
                                    if (high >= activeTrade.target) {
                                        activeTrade.tradeActive = false
                                        activeTrade.status = false
                                        pointsCaptured += activeTrade.SLInPoints * targetRatio
                                        totalTarget++
                                        totalNumberOfTradesOfTheDay++
                                    }
                                    if (low <= activeTrade.stoploss) {
                                        activeTrade.tradeActive = false
                                        activeTrade.status = false
                                        pointsCaptured -= activeTrade.SLInPoints
                                        totalNumberOfTradesOfTheDay++
                                        totalSL++
                                    }
                                } else if (activeTrade.breakoutSide == "sell") {
                                    if (low <= activeTrade.target) {
                                        activeTrade.tradeActive = false
                                        activeTrade.status = false
                                        pointsCaptured += activeTrade.SLInPoints * targetRatio
                                        totalTarget++
                                        totalNumberOfTradesOfTheDay++
                                    }
                                    if (high >= activeTrade.stoploss) {
                                        activeTrade.tradeActive = false
                                        activeTrade.status = false
                                        pointsCaptured -= activeTrade.SLInPoints
                                        totalNumberOfTradesOfTheDay++
                                        totalSL++
                                    }
                                }
                            } else {
                                // check for breakout
                                if (totalNumberOfTradesOfTheDay >= dailyAllowedTrades) {
                                    return
                                } else {
                                    // random true false
                                    if (Math.random() > 0.5) {
                                        if (close > activeTrade.breakoutRange[0]) {
                                            let SLInPoints = activeTrade.breakoutRange[0] - activeTrade.breakoutRange[1]
                                            if (SLInPoints > maxSL) return
                                            activeTrade.breakoutSide = "buy"
                                            activeTrade.tradeActive = true
                                            activeTrade.SLInPoints = SLInPoints
                                            activeTrade.stoploss = activeTrade.breakoutRange[1]
                                            activeTrade.target = SLInPoints * targetRatio + activeTrade.breakoutRange[0]
                                            activeTrade.entryPrice = activeTrade.breakoutRange[0]
                                        } else if (close < activeTrade.breakoutRange[1]) {
                                            let SLInPoints = activeTrade.breakoutRange[0] - activeTrade.breakoutRange[1]
                                            if (SLInPoints > maxSL) return
                                            activeTrade.breakoutSide = "sell"
                                            activeTrade.tradeActive = true
                                            activeTrade.SLInPoints = SLInPoints
                                            activeTrade.stoploss = activeTrade.breakoutRange[0]
                                            activeTrade.target = activeTrade.breakoutRange[1] - SLInPoints * targetRatio
                                            activeTrade.entryPrice = activeTrade.breakoutRange[1]
                                        }
                                    }
                                }
                            }
                        } else {
                            if (lastCandleData.close < lastCandleData.open && close > open) {
                                activeTrade.status = true
                                activeTrade.breakoutRange = [high, low]
                            } else if (lastCandleData.close > lastCandleData.open && close < open) {
                                activeTrade.status = true
                                activeTrade.breakoutRange = [high, low]
                            }
                        }
                    }
                }
            }
            lastCandleData = {
                open,
                close,
                high,
                low,
            }
        })
        await callback()
    }
}

asyncForEach(monthOnMonthPair, () => {
    // console.log(FirstCandleData)
    console.log("pointsCaptured", pointsCaptured)
    console.log("totalSL", totalSL)
    console.log("totalTarget", totalTarget)
    console.log("totalPostiveDays", totalPostiveDays)
    console.log("totalNegativeDays", totalNegativeDays)
})
