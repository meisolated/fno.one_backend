import cron from "cron"
import { isTodayHoliday } from "../provider/marketData.provider"
export default function fetchBars() {
	// where what we have to try to do is fetch the bars from the server ether from trueData or fyers (first try trueData)
	// then we have to save the bars to the database also emit the bars to be used by other parts of the application
	function isMarketOpen() {
		isTodayHoliday()
	}
	const OneMinuteCronJob = new cron.CronJob("*/1 * * * *", () => {}, null, true, "Asia/Kolkata")
	const FiveMinuteCronJob = new cron.CronJob("*/5 * * * *", () => {}, null, true, "Asia/Kolkata")
	const FifteenMinuteCronJob = new cron.CronJob("*/15 * * * *", () => {}, null, true, "Asia/Kolkata")
	const DailyCronJob = new cron.CronJob("40 15 * * *", () => {}, null, true, "Asia/Kolkata")

	OneMinuteCronJob.start()
	FiveMinuteCronJob.start()
	FifteenMinuteCronJob.start()
	DailyCronJob.start()
}
