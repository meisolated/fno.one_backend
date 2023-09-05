import { FyersMonthStringToNumber, TrueDataMonthStringToNumber, datePassed } from "./optionChain.helper"

import axios from "axios"
import logger from "../logger"
import { Settings } from "../model"
import { getMarketCurrentPrice } from "./marketData.helper"

const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
function sum(a: number, b: number) {
	return a + b
}
const isTodayHoliday = () => {
	const todayDay = new Date().getDay()
	// if today is sunday or saturday
	if (todayDay === 0 || todayDay === 6) {
		return true
	} else {
		return false
	}
}

const get = async (url: string) => {
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
			return false
		}
	} catch (error) {
		return false
	}
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function getRandomArbitrary(min: number, max: number) {
	return Math.random() * (max - min) + min
}

/**
 *
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 *
 */
export function getRandomInt(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function updateTaskLastUpdate(taskName: string, time: any) {
	const settings = await Settings.findOne({ id: 1 })
	if (settings) {
		settings.tasksLastRun[taskName] = time
		await settings.save()
	}
}
export { FyersMonthStringToNumber, TrueDataMonthStringToNumber, datePassed, get, getMarketCurrentPrice, isTodayHoliday, sum, timeout }
