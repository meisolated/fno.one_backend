import axios from "axios"

const appId = "6UL65YECYS-100"
const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NzM0OTY1OTEsImV4cCI6MTY3MzU2OTg1MSwibmJmIjoxNjczNDk2NTkxLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCanY0Z1B5U0QwRUI2bDBCTkZwX0ZWeTJPelJMblZlbml1b0Q4VDNBVzA1SEVVcHZOS0Y4T0dJUFk4Z2ctZWo1eDRGSy05Ri1UV3ptWWc4X1V2UTlOeThLeHJGTWJtSUcyU0VDdXVEd0FsVDZNc016Zz0iLCJkaXNwbGF5X25hbWUiOiJWSVZFSyBLVU1BUiBNVURHQUwiLCJvbXMiOm51bGwsImZ5X2lkIjoiWFYxOTgxOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.asF3Oew2H3prbQpXyjejYC3lrqwaxqIghJxuwuRlbXM"
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
    const period = 5
    const multiplier = 2 / (period + 1)
    let prevEma = 0
    let prevClose = 0
    await sleep(2000)
    axios(config)
        .then((response) => {
            const data = response.data
            const candles: Array<[number]> = data.candles
            candles.forEach((candle: Array<number>, index) => {
                const ts = candle[0]
                const open = candle[1]
                const high = candle[2]
                const low = candle[3]
                const close = candle[4]
                const volume = candle[5]
                const thisCandleDate = new Date(ts * 1000).toISOString().split("T")[0]
                const ema = (close - prevEma) * multiplier + prevEma
                if ((ema > prevClose && prevEma < prevClose) || (ema < prevClose && prevEma > prevClose)) {
                    console.log("Crossed over at Candle: ", index)
                }
                prevEma = ema
                prevClose = close
            })
        })
        .catch((error) => {
            console.log(error)
        })
})
