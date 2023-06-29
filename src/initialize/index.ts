import axios from "axios"
import config from "../config"
import chatter from "../events"
import logger from "../logger"
const maxTries = 5

const commonAxiosGet = async (url: string) => {
    try {
        const response = await axios.get(url)
        if (response.status === 200) {
            return response.data
        } else {
            logger.error("Error while fetching NSE data")
            return false
        }
    } catch (error) {
        return false
    }
}
var tasks = [
    {
        name: "NSEBankNiftyData",
        status: false,
        data: {},
        tries: 0,
        execute: async () => {
            const NSEBankNiftyData = await commonAxiosGet(config.NSEApi.NSEOptionChainDataAPIUrl("BANKNIFTY"))
            if (NSEBankNiftyData) {
                return NSEBankNiftyData.records.expiryDates
            } else {
                return false
            }
        },
    },
    {
        name: "NSENiftyData",
        status: false,
        data: {},
        tries: 0,
        execute: async () => {
            const NSENiftyData = await commonAxiosGet(config.NSEApi.NSEOptionChainDataAPIUrl("NIFTY"))
            if (NSENiftyData) {
                return NSENiftyData.records.expiryDates
            } else {
                return false
            }
        },
    },
    {
        name: "NSEFinNiftyData",
        status: false,
        tries: 0,
        data: {},
        execute: async () => {
            const NSEFinNiftyData = await commonAxiosGet(config.NSEApi.NSEOptionChainDataAPIUrl("FINNIFTY"))
            if (NSEFinNiftyData) {
                return NSEFinNiftyData.records.expiryDates
            } else {
                return false
            }
        },
    },
    {
        name: "FnOTradingHoliday",
        status: false,
        tries: 0,
        data: {},
        execute: async () => {
            const FnOTradingHoliday = await commonAxiosGet(config.NSEApi.NSEHolidaysAPIUrl("trading"))
            if (FnOTradingHoliday) {
                return FnOTradingHoliday
            } else {
                return false
            }
        }
    },
    {
        name: "IsTodayHoliday",
        status: false,
        tries: 0,
        data: {},
        execute: async () => {
            const todayDay = new Date().getDay()
            // if today is sunday or saturday
            if (todayDay === 0 || todayDay === 6) {
                return { holiday: true }
            } else {
                return { holiday: false }
            }
        }
    }
]

export default () =>
    new Promise(async (resolve, reject) => {
        logger.info(`Found ${tasks.length} tasks to execute`)
        const int = setInterval(async () => {
            tasks.forEach(async (task) => {
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
                        return logger.error(`Error while executing task ${task.name}`)
                    }
                }
            })
            const allTrue = tasks.every((task) => task.status === true)
            if (allTrue) {
                tasks.forEach((task) => {
                    console.log(task.data)
                })
                clearInterval(int)
                return resolve(true)
            }
        }, 5000)
    })
