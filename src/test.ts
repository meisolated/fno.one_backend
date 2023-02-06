import axios from "axios"

const appId = "6UL65YECYS-100"
const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NzM0OTY1OTEsImV4cCI6MTY3MzU2OTg1MSwibmJmIjoxNjczNDk2NTkxLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCanY0Z1B5U0QwRUI2bDBCTkZwX0ZWeTJPelJMblZlbml1b0Q4VDNBVzA1SEVVcHZOS0Y4T0dJUFk4Z2ctZWo1eDRGSy05Ri1UV3ptWWc4X1V2UTlOeThLeHJGTWJtSUcyU0VDdXVEd0FsVDZNc016Zz0iLCJkaXNwbGF5X25hbWUiOiJWSVZFSyBLVU1BUiBNVURHQUwiLCJvbXMiOm51bGwsImZ5X2lkIjoiWFYxOTgxOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.asF3Oew2H3prbQpXyjejYC3lrqwaxqIghJxuwuRlbXM"
const symbol = "NSE:NIFTYBANK-INDEX"
const resolution = "5"
const dateFormat = 0
const from = 1673428500
const to = 1673451000
var config = {
    method: "get",
    url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${from}&range_to=${to}&cont_flag=1`,
    // url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${from}&range_to=${to}&cont_flag=`,
    headers: {
        Authorization: appId + ":" + accessToken,
    },
}

axios(config).then((response) => {
    const data = response.data
    const candles: Array<[number]> = data.candles
    const period = 5
    const multiplier = 2 / (period + 1)
    let prevEma = 0
    let prevClose = 0
    candles.forEach((candle: Array<number>, index) => {
        const ts = candle[0]
        const open = candle[1]
        const high = candle[2]
        const low = candle[3]
        const close = candle[4]
        const volume = candle[5]
        const thisCandleDate = new Date(ts * 1000).toISOString() //.split("T")[0]
        //-------
        const ema = (close - prevEma) * multiplier + prevEma
        prevEma = ema
        prevClose = close
        console.log({ ema, open, high, low, close, thisCandleDate })
    })
})
