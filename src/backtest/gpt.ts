import moment from "moment"
import { HistoricalData } from "../model"

interface candle {
	h: number
	l: number
	o: number
	c: number
	t: number
}

const getLast12MonthsUnixTimestamps = () => {
	const twelveMonthsUnix = moment().subtract(12, "months").unix()
	const now = moment().unix()
	return { twelveMonthsUnix, now }
}

const breakoutStrategyBacktest = async () => {
	try {
		const { twelveMonthsUnix, now } = getLast12MonthsUnixTimestamps()
		const candleData = await HistoricalData.find({
			symbol: "NSE:NIFTYBANK-INDEX",
			resolution: "5",
			t: { $gte: twelveMonthsUnix, $lte: now },
		}).lean()

		if (candleData.length === 0) return console.log("No data found")

		const stopLoss = 100
		const target = stopLoss * 1
		const candleSize = 70
		let stats = {
			totalDays: 0,
			totalTrades: 0,
			totalProfit: 0,
			totalLoss: 0,
			profitableDays: 0,
			lossDays: 0,
			winningPercentage: 0,
			losingPercentage: 0,
			grossProfit: 0,
			days: {
				monday: {
					profitable: 0,
					unprofitable: 0,
				},
				tuesday: {
					profitable: 0,
					unprofitable: 0,
				},
				wednesday: {
					profitable: 0,
					unprofitable: 0,
				},
				thursday: {
					profitable: 0,
					unprofitable: 0,
				},
				friday: {
					profitable: 0,
					unprofitable: 0,
				},
				saturday: {
					profitable: 0,
					unprofitable: 0,
				},
				sunday: {
					profitable: 0,
					unprofitable: 0,
				},
			}
		} as any
		let trade = {
			entryPrice: 0,
			stopLoss: 0,
			inPosition: false,
		} as any
		let tradePossibility = {
			rangeHigh: 0,
			rangeLow: 0,
			active: false,
		} as any


		for (let i = 0; i < candleData.length; i++) {
			const currentCandle: candle = candleData[i]
			const getHoursInIST = new Date(currentCandle.t * 1000).getHours()
			const getMinutesInIST = new Date(currentCandle.t * 1000).getMinutes()
			const day = new Date(currentCandle.t * 1000).getDay()
			if (!tradePossibility.active) {
				if (getHoursInIST === 12 && getMinutesInIST === 0) {
					stats.totalDays++
					if (Math.abs(currentCandle.h - currentCandle.l) < candleSize) {
						if (day != 4) {
							tradePossibility = {
								rangeHigh: currentCandle.h,
								rangeLow: currentCandle.l,
								active: true,
							}
						}

					}
				}
			} else {
				if (trade.inPosition) {
					if (currentCandle.l < trade.stopLoss) {
						stats.totalLoss += stopLoss
						stats.lossDays++
						stats.totalTrades++
						losingDay(day)
						trade = {
							entryPrice: 0,
							stopLoss: 0,
							inPosition: false,
						}
						tradePossibility = {
							rangeHigh: 0,
							rangeLow: 0,
							active: false,
						}
					} else if (currentCandle.h > trade.entryPrice + target) {
						stats.totalProfit += currentCandle.h - trade.entryPrice
						stats.profitableDays++
						winningDay(day)
						stats.totalTrades++
						trade = {
							entryPrice: 0,
							stopLoss: 0,
							inPosition: false,
						}
						tradePossibility = {
							rangeHigh: 0,
							rangeLow: 0,
							active: false,
						}
					} else if (getHoursInIST === 15 && getMinutesInIST === 0) {
						if (currentCandle.h > trade.entryPrice) {
							stats.totalProfit += currentCandle.h - trade.entryPrice
							winningDay(day)
							stats.totalTrades++
							stats.profitableDays++
						} else {
							stats.totalLoss += stopLoss
							losingDay(day)
							stats.totalTrades++
							stats.lossDays++
						}
						trade = {
							entryPrice: 0,
							stopLoss: 0,
							inPosition: false,
						}
						tradePossibility = {
							rangeHigh: 0,
							rangeLow: 0,
							active: false,
						}
					}
				} else {
					if (currentCandle.h > tradePossibility.rangeHigh) {
						trade = {
							entryPrice: tradePossibility.rangeHigh,
							stopLoss: tradePossibility.rangeHigh - stopLoss,
							inPosition: true,
						}
					} else if (currentCandle.l < tradePossibility.rangeLow) {
						trade = {
							entryPrice: tradePossibility.rangeLow,
							stopLoss: tradePossibility.rangeLow + stopLoss,
							inPosition: true,
						}
					}
				}
			}

			function losingDay(day: number) {
				stats.days[getDayName(day)].unprofitable++
			}
			function winningDay(day: number) {
				stats.days[getDayName(day)].profitable++
			}
			function getDayName(day: number) {
				return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][day]
			}




			if (candleData.length - 1 === i) {
				console.log("Backtest Results:")
				console.log("Risk To Reward Ratio:", target / stopLoss)
				console.log("Max Candle Size:", candleSize)
				stats.winningPercentage = (stats.profitableDays / stats.totalTrades) * 100
				stats.losingPercentage = (stats.lossDays / stats.totalTrades) * 100
				stats.grossProfit = stats.totalProfit - stats.totalLoss
				console.log(stats)
			}
		}
	} catch (err) {
		console.error("Error during backtest:", err)
	} finally {
		console.log("Backtest completed")
	}
}

breakoutStrategyBacktest()
