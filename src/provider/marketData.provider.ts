import { datePassed, getCurrentDateFormatted, getDateFormatter, timePassed } from "../helper"
import { MarketData } from "../model"

export const getExpiryList = async (symbol: string) => {
	const marketData = await MarketData.findOne({ id: 1 })
	if (marketData) {
		if (symbol == "BANKNIFTY") {
			return marketData.BANKNIFTY.expiryDates
		} else if (symbol == "NIFTY") {
			return marketData.NIFTY.expiryDates
		} else if (symbol == "FINNIFTY") {
			return marketData.FINNIFTY.expiryDates
		}
	}
}
export const currentExpiry = async (symbol: string) => {
	const marketData = await MarketData.findOne({ id: 1 })
	if (marketData) {
		if (symbol == "BANKNIFTY") {
			let UpcomingExpiry = marketData.BANKNIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})
			return UpcomingExpiry[0]
		} else if (symbol == "NIFTY") {
			let UpcomingExpiry = marketData.NIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})
			return UpcomingExpiry[0]
		} else if (symbol == "FINNIFTY") {
			let UpcomingExpiry = marketData.FINNIFTY.expiryDates.filter((expiryDate) => {
				if (!datePassed(expiryDate)) {
					return expiryDate
				}
			})
			return UpcomingExpiry[0]
		}
	}
}
export const isTodayHoliday = async () => {
	const currentTime = new Date()
	const currentDay = currentTime.getDay()
	if (currentDay === 0 || currentDay === 6) return true
	const marketData = await MarketData.findOne({ id: 1 })
	if (marketData) {
		const today = getCurrentDateFormatted()
		const holidays: any = marketData.FnOHolidayList.map((holiday) => holiday.holidayDate)
		const isHoliday = holidays.includes(today)
		return isHoliday
	}
	return false
}
export const isCurrentTimeIsInMarketHours = async () => {
	if (timePassed(9, 15)) {
		if (timePassed(15, 30)) {
			return false
		} else {
			return true
		}
	}
	return false
}
export const isMarketOpen = async () => {
	const todayHoliday = await isTodayHoliday()
	if (todayHoliday) {
		return false
	} else {
		return isCurrentTimeIsInMarketHours()
	}
}
export const isTomorrowHoliday = async () => {
	const tomorrow = new Date()
	tomorrow.setDate(tomorrow.getDate() + 1)
	const tomorrowDay = tomorrow.getDay()
	if (tomorrowDay === 0 || tomorrowDay === 6) return true
	const marketData = await MarketData.findOne({ id: 1 })
	if (marketData) {
		const tomorrowFormatted = getDateFormatter(tomorrow)
		const holidays = marketData.FnOHolidayList.map((holiday) => holiday.holidayDate)
		const isHoliday = holidays.includes(tomorrowFormatted)
		return isHoliday
	}
	return false
}
