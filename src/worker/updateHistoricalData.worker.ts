/**
 * Purpose: Update historical data for only BANKNIFTY for now
 * @interval 1min
 * @interval 5min
 * @interval 15min
 * @interval 1d
 * @interval 1w
 * @for last 1 year
 * @description don't record current month data, only for 12 months except current month
 */

import { timeout, updateTaskLastUpdate } from "../helper"
import { getHistoricalData } from "../lib/broker/fyers"
import HistoricalTrueData from "../lib/trueData/historical"
import logger from "../logger"
import { HistoricalData, Settings, User } from "../model"

const generateLast12Months = (format: string) => {
	function formatDate(date: Date, isLastDay = false, format = "YYMMDDT:HH:MM:SS") {
		const yy = date.getFullYear().toString().slice(-2)
		const mm = (date.getMonth() + 1).toString().padStart(2, "0")
		const dd = isLastDay ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate().toString().padStart(2, "0") : "01"
		const hh = format === "YYYY-MM-DD" ? "09" : "09"
		const min = format === "YYYY-MM-DD" ? "15" : "00"
		const ss = format === "YYYY-MM-DD" ? "00" : "00"

		if (format === "YYYY-MM-DD") {
			return `${date.getFullYear()}-${mm}-${dd}`
		} else {
			return `${yy}${mm}${dd}T${hh}:${min}:${ss}`
		}
	}

	const monthsData = []

	const currentDate = new Date()
	const currentYear = currentDate.getFullYear()
	const currentMonth = currentDate.getMonth()

	for (let i = 1; i <= 12; i++) {
		const previousMonth = new Date(currentYear, currentMonth - i, 1)
		const startDate = formatDate(previousMonth, false, format)
		const endDate = formatDate(previousMonth, true, format)
		monthsData.push({ from: startDate, to: endDate })
	}

	return monthsData
}

/**
 *! Not using trueData for historical data because it only provides last 6 months data
 **/
const getHistoricalDataTrueData = async (symbol: string, interval: string) => {
	const intervals = ["1min", "5min", "15min"]
	const historicalData = new HistoricalTrueData()
	await historicalData.getAccessToken()
	const monthsData = generateLast12Months("YYMMDDT:HH:MM:SS")
	logger.info(`Getting historical data for ${symbol} for ${interval} and ${monthsData.length} months`, "updateHistoricalData.ts[getHistoricalDataTrueData]")
	for (const month of monthsData) {
		const data = await historicalData.getBarData(symbol, interval, month.from, month.to)
		if (!data) {
			logger.error(`No data found for ${symbol} for ${interval} for ${month.from} to ${month.to}`, "updateHistoricalData.ts[getHistoricalDataTrueData]")
		} else {
			const candleData = data.map((candle: any) => {
				return {
					symbol,
					resolution: interval,
					t: candle[0],
					o: candle[1],
					h: candle[2],
					l: candle[3],
					c: candle[4],
					v: candle[5],
				}
			})
			await HistoricalData.insertMany(candleData)
			await historicalData.sleep(1000)
			logger.info(`Inserted ${candleData.length} candles for ${symbol} for ${interval} for  ${month.from} to ${month.to}`, "updateHistoricalData.ts[getHistoricalDataTrueData]")
		}
	}
}
const getHistoricalDataFyers = async (symbol: string) => {
	const intervals = ["1", "5", "15", "1D"]
	const user = await User.findOne({ email: "fisolatedx@gmail.com" })
	if (!user) return logger.error("User not found", "updateHistoricalData.ts[getHistoricalDataFyers]")
	const monthsData = generateLast12Months("YYYY-MM-DD")
	for (const interval of intervals) {
		logger.info(`Getting historical data for ${symbol} symbol for ${interval} interval and ${monthsData.length} months`, "updateHistoricalData.ts[getHistoricalDataFyers]")
		for (const month of monthsData) {
			const data = await getHistoricalData(user.userAppsData.fyers.accessToken, symbol, interval, 1, month.from, month.to)
			if (!data) {
				logger.error(`No data found for ${symbol} symbol for ${interval} interval for ${month.from} to ${month.to}`, "updateHistoricalData.ts[getHistoricalDataFyers]")
			} else {
				const candleData = data.map((candle: any) => {
					return {
						symbol,
						resolution: interval,
						t: parseFloat(candle[0]),
						o: parseFloat(candle[1]),
						h: parseFloat(candle[2]),
						l: parseFloat(candle[3]),
						c: parseFloat(candle[4]),
						v: parseFloat(candle[5]),
					}
				})
				await timeout(2000)
				await HistoricalData.insertMany(candleData)
				logger.info(`Inserted ${candleData.length} candles for ${symbol} symbol for ${interval} interval for  ${month.from} to ${month.to}`, "updateHistoricalData.ts[getHistoricalDataFyers]")
			}
		}
	}
}
export const updateHistoricalData = async () => {
	async function update() {
		const symbol = "NSE:NIFTYBANK-INDEX"
		await HistoricalData.deleteMany({ symbol: symbol })
		await getHistoricalDataFyers(symbol)
		await updateTaskLastUpdate("lastHistoricalDataUpdate", Date.now())
		return true
	}
	const lastUpdate: any = await Settings.findOne({ id: 1 }).then((data) => data?.tasksLastRun.lastHistoricalDataUpdate)
	if (lastUpdate) {
		if (Date.now() - lastUpdate < 2592000000) return logger.info("Historical data already updated today", "updateHistoricalData.ts[updateHistoricalData]")
		logger.info(`Last historical data update found, updating historical data`, "updateHistoricalData.ts[updateHistoricalData]")
		return await update()
	} else {
		logger.info(`No last update found, updating historical data`, "updateHistoricalData.ts[updateHistoricalData]")
		await updateTaskLastUpdate("lastHistoricalDataUpdate", 0)
		return await update()
	}
}
