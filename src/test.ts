import axios from "axios"
import moment from "moment"
const appId = "6UL65YECYS-100"
const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NzU3NzM5MTUsImV4cCI6MTY3NTgxNjIxNSwibmJmIjoxNjc1NzczOTE1LCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCajRrZmI5TUlBb19MVlJrOFpiZld3VEVPY0xEUW52VE5zdGhtVVo3RmxnZjFUZTljSy1SYWtVeE1Xb2ZwancyN3JyU2YzMTU1bHdsMUdiREU1ekpzaVp4VTNobkcwcEprMlZZTUt0TVFOSjllQnB3WT0iLCJkaXNwbGF5X25hbWUiOiJWSVZFSyBLVU1BUiBNVURHQUwiLCJvbXMiOm51bGwsImZ5X2lkIjoiWFYxOTgxOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.vCN4WYWGjoJ185ZoIrA3WH8JG1aUsFcXni27B612UFE"
const symbol = "NSE:NIFTYBANK-INDEX"
const resolution = "1"
const dateFormat = 0
const _from = moment("07-11-2022", "DD-MM-YYYY").unix()
const _to = moment("06-02-2023", "DD-MM-YYYY").unix()
var config = {
    method: "get",
    url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${_from}&range_to=${_to}&cont_flag=1`,
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
