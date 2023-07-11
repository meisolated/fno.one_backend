import axios from "axios"
import { getConfig, getConfigData, initializeConfig } from "../config/initialize"
import logger from "../logger"
import { MarketData } from "../model"

export var marketData: any = {}
const maxTries = 10

const commonAxiosGet = async (url: string) => {
    const googleChromeUserAgent = "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36"
    const headers = {
        "User-Agent": googleChromeUserAgent,
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        Host: "www.nseindia.com",
        Referer: "https://www.nseindia.com/",
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
        logger.doNotLog(JSON.stringify(error), false, "", "axios error in commonAxiosGet")
        return false
    }
}
var tasks = [
    {
        name: "InitializeConfig",
        status: false,
        tries: 0,
        data: {},
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
        name: "NSEBankNiftyData",
        status: false,
        data: {},
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
        data: {},
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
        data: {},
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
        data: {},
        execute: async () => {
            const config = getConfigData()
            const url = config.apis.NSE.HolidaysAPIUrl + "trading"
            const data = await commonAxiosGet(url)
            if (data) {
                marketData = {
                    ...marketData,
                    FnOHolidayList: data.FO,
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
        data: {},
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
                        lastUpdated: new Date().toString(),
                    })
                    return true
                } catch (error: any) {
                    logger.error(error.message.toString())
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
                        lastUpdated: new Date().toString(),
                    })
                    return true
                } catch (error: any) {
                    logger.error(error.message.toString())
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
                            task.data = data
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
                tasks.forEach((task, index) => {
                    if (tasks.length - 1 == index) {
                    }
                })
                clearInterval(int)
                return resolve(true)
            }
        }, 2000)
    })
