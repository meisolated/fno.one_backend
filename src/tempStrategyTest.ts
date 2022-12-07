import axios from "axios"

const appId = "6UL65YECYS-100"
const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NjkxODA3ODMsImV4cCI6MTY2OTI0OTg0MywibmJmIjoxNjY5MTgwNzgzLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCamZhMXZNNUZIcWNBVWNkREtxczZ5ejc2eUdBV0FjMldiUE5LRDhDUzdJWWJ0WGhha0ZCWWNtNHVUb2MzbzU0V21maHZXN1RSVEpUc0VEQjB2V1dtS25KUkZqdW84bGpvdDI1ZFkxWEpFWlNxYjRsdz0iLCJkaXNwbGF5X25hbWUiOiJWSVZFSyBLVU1BUiBNVURHQUwiLCJmeV9pZCI6IlhWMTk4MTgiLCJhcHBUeXBlIjoxMDAsInBvYV9mbGFnIjoiTiJ9.WztMJc1TyFkSc9dek6WPzaK5dEDYTirouSxgHhmPMpk"
const symbol = "NSE:NIFTYBANK-INDEX"
const lastYearUnixTime = new Date().getTime() - 365 * 24 * 60 * 60 * 1000
const currentUnixTimestamp = new Date().getTime()
const resolution = "5"
const dateFormat = 0

// Analyze the data
const trades: Array<Object> = []
var profit = 0

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

monthOnMonthPair.forEach(async (month: number[], index) => {
    var config = {
        method: "get",
        url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${month[0]}&range_to=${month[1]}&cont_flag=`,
        // url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${from}&range_to=${to}&cont_flag=`,
        headers: {
            Authorization: appId + ":" + accessToken,
        },
    }

    await sleep(2000)
    axios(config)
        .then((response) => {
            const data = response.data
            const candles: Array<[number]> = data.candles
            const traget = 50
            const maxSL = 100
            const maxCandleSize = 100
            var currentDate = ""
            var lastDayofCandle = 0
            var lastCandleColor = ""
            var readyForTrade = false
            var activeTrade = false
            var activeTradeEntry = 0
            var activeTradeType = ""
            var activeTradeSL = 0
            var activeTradeEntryTime = 0

            var numberOfDays = 0
            candles.forEach((candle: Array<number>, index) => {
                const ts = candle[0]
                const open = candle[1]
                const high = candle[2]
                const low = candle[3]
                const close = candle[4]
                const volume = candle[5]
                const thisCandleDate = new Date(ts * 1000).toISOString().split("T")[0]
                if (currentDate !== thisCandleDate) {
                    console.log("Date: ", thisCandleDate, numberOfDays++)
                    activeTrade = false
                    readyForTrade = false
                    lastDayofCandle = 1
                    currentDate = thisCandleDate
                    lastCandleColor = open > close ? "red" : "green"
                } else {
                    lastDayofCandle++
                    if (lastDayofCandle == 2 || lastDayofCandle == 3 || lastDayofCandle == 4) {
                        if (readyForTrade) {
                            if (activeTradeType == "call") {
                                if (close >= activeTradeEntry || high >= activeTradeEntry) {
                                    activeTrade = true
                                    activeTradeEntryTime = ts
                                    console.log("call trade hit", thisCandleDate, activeTradeEntry, ts)
                                }
                            } else {
                                if (close <= activeTradeEntry || low <= activeTradeEntry) {
                                    activeTrade = true
                                    activeTradeEntryTime = ts
                                    console.log("put trade hit", thisCandleDate, activeTradeEntry, ts)
                                }
                            }
                        } else {
                            const CC = open > close ? "red" : "green"
                            if (lastCandleColor !== CC) {
                                lastCandleColor = CC
                                readyForTrade = true
                                activeTradeType = CC === "red" ? "put" : "call"
                                // if(activeTradeType== "put") return readyForTrade = false
                                activeTradeEntry = activeTradeType === "put" ? low : high
                                // activeTradeSL = activeTradeType === "put" ? high : low
                                activeTradeSL = activeTradeType === "put" ? activeTradeEntry + maxSL : activeTradeEntry - maxSL
                                if (activeTradeType === "call") {
                                    if (open - close > maxCandleSize) {
                                        readyForTrade = false
                                    }
                                } else {
                                    if (close - open > maxCandleSize) {
                                        readyForTrade = false
                                    }
                                }
                                console.log("ready for trade", thisCandleDate, CC, activeTradeEntry, activeTradeSL)
                            }
                        }
                    } else {
                        if (activeTrade) {
                            if (activeTradeType == "call") {
                                if (high >= activeTradeEntry + traget) {
                                    profit += traget
                                    activeTrade = false
                                    readyForTrade = false
                                    trades.push({
                                        type: "call",
                                        entry: activeTradeEntry,
                                        exit: activeTradeEntry + traget,
                                        entryTime: new Date(activeTradeEntryTime * 1000),
                                        exitTime: new Date(ts * 1000),
                                        profit: traget,
                                        profitable: true,
                                    })
                                    console.log("call target hit", thisCandleDate, high, ts)
                                }
                                if (low <= activeTradeSL) {
                                    profit -= activeTradeEntry - activeTradeSL
                                    activeTrade = false
                                    readyForTrade = false
                                    trades.push({
                                        type: "call",
                                        entry: activeTradeEntry,
                                        exit: activeTradeSL,
                                        entryTime: new Date(activeTradeEntryTime * 1000),
                                        exitTime: new Date(ts * 1000),
                                        profit: activeTradeEntry - activeTradeSL,
                                        profitable: false,
                                    })
                                    console.log("call SL hit", thisCandleDate, low, ts)
                                }
                            }
                            if (activeTradeType == "put") {
                                if (low <= activeTradeEntry - traget) {
                                    profit += traget
                                    activeTrade = false
                                    readyForTrade = false
                                    trades.push({
                                        type: "put",
                                        entry: activeTradeEntry,
                                        exit: activeTradeEntry - traget,
                                        entryTime: new Date(activeTradeEntryTime * 1000),
                                        exitTime: new Date(ts * 1000),
                                        profit: traget,
                                        profitable: true,
                                    })
                                    console.log("put target hit", thisCandleDate, low, ts)
                                }
                                if (high >= activeTradeSL) {
                                    profit -= activeTradeSL - activeTradeEntry
                                    activeTrade = false
                                    readyForTrade = false
                                    trades.push({
                                        type: "put",
                                        entry: activeTradeEntry,
                                        exit: activeTradeSL,
                                        entryTime: new Date(activeTradeEntryTime * 1000),
                                        exitTime: new Date(ts * 1000),
                                        profit: activeTradeSL - activeTradeEntry,
                                        profitable: false,
                                    })
                                    console.log("put SL hit", thisCandleDate, high, ts)
                                }
                            }
                        } else {
                            if (readyForTrade) {
                                if (activeTradeType == "call") {
                                    if (close >= activeTradeEntry || high >= activeTradeEntry) {
                                        activeTrade = true
                                        activeTradeEntryTime = ts
                                        console.log("call trade hit", thisCandleDate, activeTradeEntry, ts)
                                    }
                                } else {
                                    if (close <= activeTradeEntry || low <= activeTradeEntry) {
                                        activeTrade = true
                                        activeTradeEntryTime = ts
                                        console.log("put trade hit", thisCandleDate, activeTradeEntry, ts)
                                    }
                                }
                            }
                        }
                    }
                    // currentDate = new Date(ts * 1000).toISOString().split("T")[0]
                }
                if (candles.length - 1 == index) {
                    // @ts-ignore
                    const totalProfitableTrades = trades.filter((trade) => trade.profitable).length
                    console.table(trades)
                    console.log("target", traget, "points")
                    console.log("max SL", maxSL, "points")
                    console.log("max candle size", maxCandleSize, "points")
                    console.log("profit", profit, "points")
                    // @ts-ignore
                    const totalProfit = trades.filter((trade) => trade.profitable).reduce((acc, trade) => acc + trade.profit, 0)
                    console.log("totalProfit", totalProfit, "points")
                    // @ts-ignore
                    const totalLoss = trades.filter((trade) => !trade.profitable).reduce((acc, trade) => acc + trade.profit, 0)
                    console.log("totalLoss", totalLoss, "points")
                    // @ts-ignore
                    const totalCalls = trades.filter((trade) => trade.type === "call").length
                    console.log("totalCalls", totalCalls)
                    // @ts-ignore
                    const totalCallProfit = trades.filter((trade) => trade.type === "call" && trade.profitable).reduce((acc, trade) => acc + trade.profit, 0)
                    console.log("totalCallProfit", totalCallProfit, "points")
                    // @ts-ignore
                    const totalPuts = trades.filter((trade) => trade.type === "put").length
                    console.log("totalPuts", totalPuts)
                    // @ts-ignore
                    const totalPutProfit = trades.filter((trade) => trade.type === "put" && trade.profitable).reduce((acc, trade) => acc + trade.profit, 0)
                    console.log("totalPutProfit", totalPutProfit, "points")
                    console.log("totalProfitableTrades", totalProfitableTrades, "out of", trades.length)
                }
            })
        })
        .catch((error) => {
            console.log(error)
        })
})
