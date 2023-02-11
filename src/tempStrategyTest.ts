import axios from "axios"

const appId = "6UL65YECYS-100"
const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NzU5MTI1NDEsImV4cCI6MTY3NTk4OTA0MSwibmJmIjoxNjc1OTEyNTQxLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCajVHVmRYalZVMGtZMTdIVko1YmNJSmhsQ3Z0UFdYOExNNC0wQTQ1ZVJkcWJaSV92S0dWWWlTSEJBdWhpbE1lVFR3S2F5ZFZFN3M3dnR3TjBxWmQxY0V5SFk3emRXWW54LXpoSkYyQzAwRE8xOTBHYz0iLCJkaXNwbGF5X25hbWUiOiJWSVZFSyBLVU1BUiBNVURHQUwiLCJvbXMiOm51bGwsImZ5X2lkIjoiWFYxOTgxOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.XUUjblf8hqndYW6zBB4VEbUNql2p7VFdL6TtL_sPG4g"

const symbol = "NSE:NIFTYBANK-INDEX"
const lastYearUnixTime = new Date().getTime() - 365 * 24 * 60 * 60 * 1000
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
const FirstCandleData: any = []

const averagePositiveMove: Array<number> = []
const averageNegativeMove: Array<number> = []
const averagePositiveSideLow: Array<number> = []
const averageNegativeSideHigh: Array<number> = []
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
        var yesterdayDate: any = 0
        var firstCandlePassed = false
        candles.forEach((candle: Array<number>, index) => {
            const ts = candle[0]
            const open = candle[1]
            const high = candle[2]
            const low = candle[3]
            const close = candle[4]
            const volume = candle[5]
            const thisCandleDate = new Date(ts * 1000).toISOString().split("T")[0]

            if (yesterdayDate !== thisCandleDate) {
                firstCandlePassed = true
                const move: number = close - open
                const positiveMove: number = move > 0 ? move : 0
                const negativeMove: number = move < 0 ? move : 0
                if (positiveMove != 0) averagePositiveMove.push(positiveMove)
                if (negativeMove != 0) averageNegativeMove.push(negativeMove)

                if (positiveMove != 0) averagePositiveSideLow.push(open - low)
                if (negativeMove != 0) averageNegativeSideHigh.push(open - high)
                FirstCandleData.push([ts, open, high, low, close, volume, negativeMove, positiveMove])
            }
            yesterdayDate = thisCandleDate
        })
        await callback()
    }
}
function getAverage(array: Array<number>) {
    let sum = 0
    for (let i = 0; i < array.length; i++) {
        sum += array[i]
    }
    //heigh and low
    const high = Math.max(...array)
    const low = Math.min(...array)
    return { average: sum / array.length, high, low }
}

asyncForEach(monthOnMonthPair, () => {
    // console.log(FirstCandleData)

    const firstCandleAverageNegativeMovement = getAverage(averageNegativeMove)
    const firstCandleAveragePositiveMovement = getAverage(averagePositiveMove)
    const firstCandleAveragePositiveSideLow = getAverage(averagePositiveSideLow)
    const firstCandleAverageNegativeSideHigh = getAverage(averageNegativeSideHigh)

    const firstCandleGreen = FirstCandleData.filter((candle: any) => {
        return candle[4] - candle[1] > 0 && candle[4] > candle[1]
    })
    const firstCandleRed = FirstCandleData.filter((candle: any) => {
        return candle[4] - candle[1] < 0 && candle[4] < candle[1]
    })
    const firstCandleGreenProbability = firstCandleGreen.length / FirstCandleData.length
    const firstCandleRedProbability = firstCandleRed.length / FirstCandleData.length
    console.log("------------------------------------_------------------------------------")
    console.log({
        firstCandleAverageNegativeMovement,
        firstCandleAveragePositiveMovement,
        firstCandleAveragePositiveSideLow,
        firstCandleAverageNegativeSideHigh,
        firstCandleGreen: firstCandleGreen.length,
        firstCandleRed: firstCandleRed.length,
        firstCandleGreenProbability,
        firstCandleRedProbability,
    })
})
