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

const timestampToStringDateNTime = (timestamp: number) => {
	let date_ob = new Date(timestamp * 1000)

	// current date
	// adjust 0 before single digit date
	let date = ("0" + date_ob.getDate()).slice(-2)

	// current month
	let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)

	// current year
	let year = date_ob.getFullYear()

	// current hours
	let hours = date_ob.getHours()

	// current minutes
	let minutes = date_ob.getMinutes()

	// current seconds
	let seconds = date_ob.getSeconds()

	return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
}

function setEpochTimeTo5_30(epochTimestamp: number) {
	const date = new Date(epochTimestamp * 1000)
	date.setHours(5, 30, 0, 0)
	const updatedEpochTimestamp = date.getTime() / 1000
	return updatedEpochTimestamp
}

function setEpochTimeTo5_30AndOneDayBefore(epochTimestamp: number) {
	const date = new Date(epochTimestamp * 1000)
	const oneDayInMilliseconds = 24 * 60 * 60 * 1000
	date.setTime(date.getTime() - oneDayInMilliseconds)
	date.setHours(5, 30, 0, 0)
	const updatedEpochTimestamp = date.getTime() / 1000
	return updatedEpochTimestamp
}

//To be moved to physiology  later
function calculatePivotPointsAndSupportResistance(high: number, low: number, close: number) {
	const pivotPoint = (high + low + close) / 3

	const support1 = 2 * pivotPoint - high
	const support2 = pivotPoint - (high - low)
	const support3 = low - 2 * (high - pivotPoint)
	const support4 = support3 - (high - low)
	const support5 = support4 - (high - low)
	const support6 = support5 - (high - low)

	const resistance1 = 2 * pivotPoint - low
	const resistance2 = pivotPoint + (high - low)
	const resistance3 = high + 2 * (pivotPoint - low)
	const resistance4 = resistance3 + (high - low)
	const resistance5 = resistance4 + (high - low)
	const resistance6 = resistance5 + (high - low)

	return {
		pivotPoint,
		support1,
		support2,
		support3,
		support4,
		support5,
		support6,
		resistance1,
		resistance2,
		resistance3,
		resistance4,
		resistance5,
		resistance6,
	}
}
function getDayOfWeekAsString(date: number) {
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const dayIndex = date

	if (dayIndex >= 0 && dayIndex < daysOfWeek.length) {
		return daysOfWeek[dayIndex]
	} else {
		return 'Invalid Day'
	}
}
function isNumberInRange(number: number, min: number, max: number) {
	return number >= min && number <= max
}

export {
	FyersMonthStringToNumber,
	TrueDataMonthStringToNumber,
	calculatePivotPointsAndSupportResistance,
	datePassed,
	get, getDayOfWeekAsString, getMarketCurrentPrice, isNumberInRange, isTodayHoliday,
	setEpochTimeTo5_30,
	setEpochTimeTo5_30AndOneDayBefore,
	sum,
	timeout,
	timestampToStringDateNTime
}

