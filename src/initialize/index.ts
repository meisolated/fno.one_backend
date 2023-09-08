import { getConfig, getConfigData, initializeConfig } from "../config/initialize"

import axios from "axios"
import { timeout, updateTaskLastUpdate } from "../helper"
import logger from "../logger"
import { MarketData, Settings } from "../model"
import { convertMarketTicksToBars, optionRelativeMovementCalculator, updateSymbolLTP, updateSymbolMasterData } from "../worker"
import { updateHistoricalData } from "../worker/updateHistoricalData"

export var marketData: any = {}
const maxTries = 10

const commonAxiosGet = async (url: string) => {
	const googleChromeUserAgent = "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36"
	const headers = {
		"User-Agent": googleChromeUserAgent,
		"Accept": "*/*",
		"Accept-Encoding": "gzip, deflate, br",
		"Connection": "keep-alive",
		"Host": "www.nseindia.com",
		"Referer": "https://www.nseindia.com/",
		"Sec-Fetch-Dest": "empty",
		"Sec-Fetch-Mode": "cors",
		"Sec-Fetch-Site": "same-origin",
	}
	try {
		const response = await axios.get(url, { headers })
		if (response.status === 200) {
			return response.data
		} else {
			logger.error("Error while fetching NSE data", "initialize/index.ts[commonAxiosGet]")
			return false
		}
	} catch (error) {
		logger.info(JSON.stringify(error), "initialize/index.ts[commonAxiosGet]")
		return false
	}
}
var tasks = [
	{
		name: "InitializeConfig",
		importance: 1,
		status: false,
		tries: 0,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				await initializeConfig()
				await getConfig()
				const conf = getConfigData()
				return resolve({
					config: conf,
				})
			}),
	},
	{
		name: "CheckIfLastUpdatedInLast1Days",
		importance: 1,
		status: false,
		tries: 0,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				const marketData = await MarketData.findOne({ id: 1 })
				if (!marketData) {
					return resolve(true)
				} else {
					const lastUpdated: number = marketData.lastUpdated as any
					const now = Date.now()
					const diff = now - lastUpdated
					const diffInDays = diff / (1000 * 3600 * 24)
					if (diffInDays < 1) {
						logger.info("Market Data is updated in last 1 days, no need to update again", "initialize/index.ts[CheckIfLastUpdatedInLast1Days]")
						tasks.forEach((task) => {
							if (
								task.name === "NSEBankNiftyData" ||
								task.name === "NSENiftyData" ||
								task.name === "NSEFinNiftyData" ||
								task.name === "FnOTradingHoliday" ||
								task.name === "SaveMarketDataToDB"
							) {
								task.status = true
								logger.info(`Task ${task.name} is skipped`, "initialize/index.ts[CheckIfLastUpdatedInLast1Days]")
							}
						})
						return resolve(true)
					} else {
						logger.info("Market Data is not updated in last 1 days", "initialize/index.ts[CheckIfLastUpdatedInLast1Days]")
						return resolve(true)
					}
				}
			}),
	},
	{
		name: "NSEBankNiftyData",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				const name = "BANKNIFTY"
				const config = getConfigData()
				const url = config.apis.NSE.OptionChainDataAPIUrl + name
				const data = await commonAxiosGet(url)
				if (data) {
					marketData = {
						...marketData,
						[name]: {
							derivativeName: name,
							expiryDates: data.records.expiryDates,
							strikePrices: data.records.strikePrices,
						},
					}

					return resolve(true)
				}
				return resolve(false)
			}),
	},
	{
		name: "NSENiftyData",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				const name = "NIFTY"
				const config = getConfigData()
				const url = config.apis.NSE.OptionChainDataAPIUrl + name
				const data = await commonAxiosGet(url)
				if (data) {
					marketData = {
						...marketData,
						[name]: {
							derivativeName: name,
							expiryDates: data.records.expiryDates,
							strikePrices: data.records.strikePrices,
						},
					}
					return resolve(true)
				}
				return resolve(false)
			}),
	},
	{
		name: "NSEFinNiftyData",
		status: false,
		tries: 0,
		importance: 0,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				const name = "FINNIFTY"
				const config = getConfigData()
				const url = config.apis.NSE.OptionChainDataAPIUrl + name
				const data = await commonAxiosGet(url)
				if (data) {
					marketData = {
						...marketData,
						[name]: {
							derivativeName: name,
							expiryDates: data.records.expiryDates,
							strikePrices: data.records.strikePrices,
						},
					}
					return resolve(true)
				}
				return resolve(false)
			}),
	},
	{
		name: "FnOTradingHoliday",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				const config = getConfigData()
				const url = config.apis.NSE.HolidaysAPIUrl + "trading"
				const data = await commonAxiosGet(url)
				if (data) {
					const preparedData = data.FO.map((item: any) => {
						return {
							holidayDate: item.tradingDate,
							weekDay: item.weekDay,
							description: item.description,
						}
					})
					marketData = {
						...marketData,
						FnOHolidayList: preparedData,
					}
					return resolve(true)
				}
				return resolve(false)
			}),
	},
	{
		name: "SaveMarketDataToDB",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				// find if data is already present in DB
				const getDataOfMarketData = await MarketData.find({ id: 1 })
				if (getDataOfMarketData.length > 0) {
					// first we need to delete the existing data
					try {
						await MarketData.deleteMany({ id: 1 })
						await MarketData.create({
							id: 1,
							BANKNIFTY: marketData.BANKNIFTY,
							NIFTY: marketData.NIFTY,
							FINNIFTY: marketData.FINNIFTY,
							FnOHolidayList: marketData.FnOHolidayList,
							lastUpdated: Date.now(),
						})
						return resolve(true)
					} catch (error: any) {
						logger.info(error.message.toString(), "initialize/index.ts[SaveMarketDataToDB]")
						return resolve(false)
					}
				} else {
					try {
						await MarketData.create({
							id: 1,
							BANKNIFTY: marketData.BANKNIFTY,
							NIFTY: marketData.NIFTY,
							FINNIFTY: marketData.FINNIFTY,
							FnOHolidayList: marketData.FnOHolidayList,
							lastUpdated: Date.now(),
						})
						return resolve(true)
					} catch (error: any) {
						logger.info(error.message.toString(), "initialize/index.ts[SaveMarketDataToDB]")
						return resolve(false)
					}
				}
			}),
	},
	{
		name: "startSymbolDataUpdate",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				updateSymbolLTP()
				return resolve(true)
			}),
	},
	{
		name: "convertMarketTicksToBars",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				// convertMarketTicksToBars()
				return resolve(true)
			}),
	},

	{
		name: "symbolMasterDataUpdate",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				const lastUpdate: any = await Settings.findOne({ id: 1 }).then((data) => data?.tasksLastRun.symbolMasterDataUpdate)
				if (lastUpdate) {
					//  check is lastupdate is more than 2days
					const now = Date.now()
					const diff = now - lastUpdate
					const diffInDays = diff / (1000 * 3600 * 24)
					if (diffInDays < 2) {
						logger.info("Symbol Master Data is updated in last 2 days, no need to update again", "initialize/index.ts[symbolMasterDataUpdate]")
						return resolve(true)
					} else {
						logger.info("Symbol Master Data is not updated in last 2 days. Updating now...", "initialize/index.ts[symbolMasterDataUpdate]")
						const returned = await updateSymbolMasterData()
						if (returned) {
							await updateTaskLastUpdate("symbolMasterDataUpdate", Date.now())
							return resolve(true)
						} else {
							return resolve(false)
						}
					}
				} else {
					await updateTaskLastUpdate("symbolMasterDataUpdate", 0)
					return resolve(false)
				}
			}),
	},
	{
		name: "historicalDataUpdate",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				await updateHistoricalData()
				return resolve(true)
			}),
	},
	{
		name: "startOptionRelativeMovementCalculator",
		status: false,
		tries: 0,
		importance: 1,
		execute: async () =>
			new Promise(async (resolve, reject) => {
				await optionRelativeMovementCalculator()
				return resolve(true)
			}),
	},
]

export default () =>
	new Promise(async (resolve, reject) => {
		logger.info(`Found ${tasks.length} tasks to execute`, "initialize/index.ts")
		const tick = performance.now()
		async function runTasksSequentially(taskList: any) {
			for (const task of taskList) {
				if (task.status === false) {
					logger.info(`Waiting for ${task.name} to complete...`, "initialize/index.ts")
					const returned = await task.execute()
					await timeout(1000)
					if (returned) {
						task.status = true
						logger.info(`Task ${task.name} is completed`, "initialize/index.ts")
					} else {
						task.tries++
						logger.info(`Task ${task.name} is failed, retrying again`, "initialize/index.ts")
						if (task.tries > maxTries) {
							logger.info(`Task ${task.name} is failed, max tries reached`, "initialize/index.ts")
							return resolve(false)
						}
						return runTasksSequentially(taskList)
					}
				}
			}
			return resolve(true)
		}
		const took = (performance.now() - tick) / 1000
		await runTasksSequentially(tasks)
	})
