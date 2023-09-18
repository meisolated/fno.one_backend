import cron from "cron"
import { isMarketOpen } from "../provider/marketData.provider"
const timeZone = "Asia/Kolkata"
export default function fetchBars() {
    // where what we have to try to do is fetch the bars from the server ether from trueData or fyers (first try trueData)
    // then we have to save the bars to the database also emit the bars to be used by other parts of the application

    function tryFetchBarsFromTrueData() {

    }
    function tryFetchBarsFromFyers() {

    }


    const OneMinuteCronJob = new cron.CronJob("*/1 * * * *", async () => {
        const marketOpen = await isMarketOpen()
    }, null, true, timeZone)
    const FiveMinuteCronJob = new cron.CronJob("*/5 * * * *", async () => {
        const marketOpen = await isMarketOpen()
    }, null, true, timeZone)
    const FifteenMinuteCronJob = new cron.CronJob("*/15 * * * *", async () => {
        const marketOpen = await isMarketOpen()
    }, null, true, timeZone)
    const DailyCronJob = new cron.CronJob("40 15 * * *", async () => {
        const marketOpen = await isMarketOpen()
    }, null, true, timeZone)

    OneMinuteCronJob.start()
    FiveMinuteCronJob.start()
    FifteenMinuteCronJob.start()
    DailyCronJob.start()
}
