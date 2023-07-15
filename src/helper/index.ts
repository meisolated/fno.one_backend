import { FyersMonthStringToNumber, TrueDataMonthStringToNumber, datePassed } from "./optionChain.helper"

import axios from "axios"
import { getMarketCurrentPrice } from "./marketData.helper"
import logger from "../logger"

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

export { TrueDataMonthStringToNumber, datePassed, get, FyersMonthStringToNumber, getMarketCurrentPrice, isTodayHoliday, sum, timeout }

