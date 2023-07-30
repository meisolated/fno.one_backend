import { getConfig, getConfigData, initializeConfig } from "../config/initialize"

import { MarketData } from "../model"
import axios from "axios"
import logger from "../logger"

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
			logger.error("Error while fetching NSE data")
			return false
		}
	} catch (error) {
		logger.doNotLog(JSON.stringify(error), false, "", "axios error in commonAxiosGet initialize/index.ts")
		return false
	}
}
var tasks = [
	{
		name: "InitializeConfig",
		status: false,
		tries: 0,
		execute: async () => {
			await initializeConfig()
			await getConfig()
			const conf = getConfigData()
			return {
				config: conf,
			}
		},
	},
	{
		name: "CheckIfLastUpdatedInLast1Days",
		status: false,
		tries: 0,
		execute: async () => {
			const marketData = await MarketData.findOne({ id: 1 })
			if (!marketData) {
				return true
			} else {
				const lastUpdated: number = marketData.lastUpdated as any
				const now = Date.now()
				const diff = now - lastUpdated
				const diffInDays = diff / (1000 * 3600 * 24)
				if (diffInDays < 1) {
					logger.info("Market Data is updated in last 1 days, no need to update again")
					tasks.forEach((task) => {
						if (
							task.name === "NSEBankNiftyData" ||
							task.name === "NSENiftyData" ||
							task.name === "NSEFinNiftyData" ||
							task.name === "FnOTradingHoliday" ||
							task.name === "SaveMarketDataToDB"
						) {
							task.status = true
							logger.info(`Task ${task.name} is skipped`)
						}
					})
					return true
				} else {
					logger.info("Market Data is not updated in last 1 days")
					return true
				}
			}
		},
	},
	{
		name: "NSEBankNiftyData",
		status: false,
		tries: 0,
		execute: async () => {
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

				return true
			}
			return false
		},
	},
	{
		name: "NSENiftyData",
		status: false,
		tries: 0,
		execute: async () => {
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
				return true
			}
			return false
		},
	},
	{
		name: "NSEFinNiftyData",
		status: false,
		tries: 0,
		execute: async () => {
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
				return true
			}
			return false
		},
	},
	{
		name: "FnOTradingHoliday",
		status: false,
		tries: 0,
		execute: async () => {
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
				return true
			}
			return false
		},
	},
	{
		name: "SaveMarketDataToDB",
		status: false,
		tries: 0,
		execute: async () => {
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
					return true
				} catch (error: any) {
					logger.doNotLog(error.message.toString())
					return false
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
					return true
				} catch (error: any) {
					logger.doNotLog(error.message.toString())
					return false
				}
			}
		},
	},
]

export default () =>
	new Promise(async (resolve, reject) => {
		logger.info(`Found ${tasks.length} tasks to execute`)
		const int = setInterval(async () => {
			tasks.forEach(async (task, index) => {
				const isPreviousTaskCompleted = tasks.slice(0, index).every((task) => task.status === true)
				if (isPreviousTaskCompleted) {
					if (task.tries >= maxTries) {
						clearInterval(int)
						return reject(`Task ${task.name} failed to execute`)
					}
					if (task.status === false) {
						const data = await task.execute()
						if (data) {
							task.status = true
							task.tries = 0
							logger.info(`Task ${task.name} executed successfully`)
						} else {
							task.tries = task.tries + 1
							return logger.error(`Error while executing task ${task.name} will make ${maxTries - task.tries} more attempts`)
						}
					}
				}
			})
			const allTrue = tasks.every((task) => task.status === true)
			if (allTrue) {
				clearInterval(int)
				return resolve(true)
			}
		}, 2000)
	})
