import fs from "fs"
import { getDayOfWeekAsString, isNumberInRange, setEpochTimeTo5_30AndOneDayBefore, timeout, timestampToStringDateNTime } from "../../../helper"
import { HistoricalData } from "../../../model"
const groupCandlesIntoDays = async (candles: any) => {
	const groupedArray: any = []
	let currentCandleDate = ""
	let currentDayArray: any = []

	// Sort the candles by timestamp to ensure they are in chronological order
	// candles.sort((a, b) => a.t - b.t)
	candles.forEach((candle: any, index: number) => {
		const candleDate = new Date(Number(candle.t) * 1000).toDateString()
		if (candleDate !== currentCandleDate) {
			if (currentDayArray.length > 0) {
				groupedArray.push(currentDayArray)
			}
			currentCandleDate = candleDate
			currentDayArray = [candle]
		} else {
			currentDayArray.push(candle)
		}
		if (index == candles.length - 1) {
			groupedArray.push(currentDayArray)
		}
	})

	// for (const candle of candles) {

	// }
	return groupedArray
}

export default async () => {
	const FiveMinHistoricalData = await HistoricalData.find({ resolution: "5", symbol: "NSE:NIFTYBANK-INDEX" }).lean()
	const historicalDataSorted = FiveMinHistoricalData.sort((a, b) => Number(a.t) - Number(b.t))
	const dailyCandlesArray = await groupCandlesIntoDays(historicalDataSorted)
	console.log(`Total days: ${dailyCandlesArray.length}`)
	console.log(`Total candles: ${historicalDataSorted.length}`)
	const funds = 50000 // 50k
	const averagePremium = 300
	const premiumDecayFor1hour = 0.1
	const RiskAndRewardRatio = 3
	const maxStopLossInPoints = 100
	const pointsToPremium = 0.5
	const TargetBuffer = 10
	const StopLossBuffer = 10
	let results = [] as any
	let currentTrade = {
		entry: 0,
		target: 0,
		stopLoss: 0,
		entryTime: "",
		exitTime: "",
		stopLossInPoints: 0,
		profitInPoints: 0,
		tradeStatus: "waitingForInfo",
		enteredSide: "",
		upsideEntryLevel: 0,
		downsideEntryLevel: 0,
		passCurrentDay: false,
		tradeResult: "",
		pointsCaptured: 0,
		pointsLost: 0,
		day: "",
		month: 0,
	}

	console.log(`Starting backtest`)
	for (const data of dailyCandlesArray) {
		let candlePair = [] as any
		let tradesPreDay = 0
		// const dayBeforeEpochValue = setEpochTimeTo5_30AndOneDayBefore(data[0].t)
		// const dayBeforeDailyCandle = await HistoricalData.findOne({ t: dayBeforeEpochValue, resolution: "1D", symbol: "NSE:NIFTYBANK-INDEX" })
		// if (!dayBeforeDailyCandle) console.log("dayBeforeDailyCandle not found", dayBeforeEpochValue)

		data.forEach(async (candle: any) => {
			if (tradesPreDay == 1) return
			const currentCandleTime = new Date(Number(candle.t * 1000))
			const currentCandleTimeHour = currentCandleTime.getHours()
			const currentCandleTimeMinute = currentCandleTime.getMinutes()
			const currentDay = getDayOfWeekAsString(currentCandleTime.getDay())
			const targetHour = 1
			const targetMinute = 0

			if (currentCandleTimeHour > 14) return
			if (currentCandleTimeHour > targetHour || (currentCandleTimeHour === targetHour && currentCandleTimeMinute >= targetMinute)) {
				// if (currentTrade.passCurrentDay == true) {
				//     if (currentDate == currentCandleTime.toDateString()) {
				//         return
				//     }
				// }
				if (currentTrade.tradeStatus == "waitingForInfo") {
					if (candlePair.length == 0) {
						return candlePair.push(candle)
					} else if (candlePair.length == 1) {
						const currentCandleColor = candle.c > candle.o ? "green" : "red"
						const previousCandleColor = candlePair[0].c > candlePair[0].o ? "green" : "red"
						if (currentCandleColor != previousCandleColor) {
							const high = candle.h > candlePair[0].h ? candle.h : candlePair[0].h
							const low = candle.l < candlePair[0].l ? candle.l : candlePair[0].l
							if (high - low > maxStopLossInPoints) {
								//remove the previous candle and add the current candle
								candlePair.pop()
								candlePair.push(candle)
								return
							} else {
								if (isNumberInRange(high - low, 30, 60)) {
									currentTrade.upsideEntryLevel = Number(high) + Number(TargetBuffer)
									currentTrade.downsideEntryLevel = Number(low) - Number(TargetBuffer)
									currentTrade.stopLossInPoints = Number((high - low).toFixed(2))
									currentTrade.profitInPoints = Number((currentTrade.stopLossInPoints * RiskAndRewardRatio).toFixed(2))
									currentTrade.tradeStatus = "waitingForEntry"
									return
								} else {
									candlePair.pop()
									candlePair.push(candle)
									return
								}
							}
						} else {
							candlePair.pop()
							candlePair.push(candle)
							return
						}
					}
				}
				if (currentTrade.tradeStatus == "waitingForEntry") {
					// check is if the current candle is breaking upsideEntryLevel or downsideEntryLevel
					const breakOut = candle.h > currentTrade.upsideEntryLevel ? "upside" : candle.l < currentTrade.downsideEntryLevel ? "downside" : false
					if (breakOut == false) return
					if (breakOut == "upside") {
						currentTrade.entry = Number(currentTrade.upsideEntryLevel)
						currentTrade.target = Number(currentTrade.upsideEntryLevel + Number(((currentTrade.upsideEntryLevel - currentTrade.downsideEntryLevel) * RiskAndRewardRatio).toFixed(2)))
						currentTrade.stopLoss = Number(currentTrade.downsideEntryLevel)
						currentTrade.entryTime = timestampToStringDateNTime(candle.t)
						currentTrade.tradeStatus = "entered"
						currentTrade.enteredSide = "upside"
						return
					} else if (breakOut == "downside") {
						currentTrade.entry = Number(currentTrade.downsideEntryLevel)
						currentTrade.target = Number(currentTrade.downsideEntryLevel - Number((currentTrade.upsideEntryLevel - currentTrade.downsideEntryLevel) * RiskAndRewardRatio))
						currentTrade.stopLoss = Number(currentTrade.upsideEntryLevel)
						currentTrade.entryTime = timestampToStringDateNTime(candle.t)
						currentTrade.tradeStatus = "entered"
						currentTrade.enteredSide = "downside"
						return
					}
				}
				if (currentTrade.tradeStatus == "entered") {
					// check if the current candle is breaking target or stopLoss
					if (currentTrade.enteredSide == "upside") {
						if (candle.l < currentTrade.stopLoss) {
							currentTrade.exitTime = timestampToStringDateNTime(candle.t)
							currentTrade.tradeStatus = "exited"
							currentTrade.tradeResult = "loss"
							currentTrade.pointsLost = Number(Math.abs(currentTrade.stopLoss - currentTrade.entry).toFixed(2))
							return
						} else if (candle.h > currentTrade.target) {
							currentTrade.exitTime = timestampToStringDateNTime(candle.t)
							currentTrade.tradeStatus = "exited"
							currentTrade.tradeResult = "profit"
							currentTrade.pointsCaptured = Number(Math.abs(currentTrade.target - currentTrade.entry).toFixed(2))
							return
						} else {
							if (currentCandleTimeHour >= 14) {
								if (candle.c > currentTrade.entry) {
									currentTrade.exitTime = timestampToStringDateNTime(candle.t)
									currentTrade.tradeStatus = "exited"
									currentTrade.tradeResult = "timeOutProfit"
									currentTrade.pointsCaptured = Math.abs(candle.c - currentTrade.entry)
									return
								} else {
									currentTrade.exitTime = timestampToStringDateNTime(candle.t)
									currentTrade.tradeStatus = "exited"
									currentTrade.tradeResult = "timeOutLoss"
									currentTrade.pointsLost = Math.abs(currentTrade.entry - candle.l)
									return
								}
							}
						}
					} else if (currentTrade.enteredSide == "downside") {
						if (candle.h > currentTrade.stopLoss) {
							currentTrade.exitTime = timestampToStringDateNTime(candle.t)
							currentTrade.tradeStatus = "exited"
							currentTrade.tradeResult = "loss"
							currentTrade.pointsLost = Math.abs(currentTrade.stopLoss - currentTrade.entry)
							return
						} else if (candle.l < currentTrade.target) {
							currentTrade.exitTime = timestampToStringDateNTime(candle.t)
							currentTrade.tradeStatus = "exited"
							currentTrade.tradeResult = "profit"
							currentTrade.pointsCaptured = Math.abs(currentTrade.entry - currentTrade.target)
							return
						} else {
							if (currentCandleTimeHour >= 14) {
								if (candle.c > currentTrade.entry) {
									currentTrade.exitTime = timestampToStringDateNTime(candle.t)
									currentTrade.tradeStatus = "exited"
									currentTrade.tradeResult = "timeOutLoss"
									currentTrade.pointsLost = Math.abs(candle.c - currentTrade.entry)
									return
								} else {
									currentTrade.exitTime = timestampToStringDateNTime(candle.t)
									currentTrade.tradeStatus = "exited"
									currentTrade.tradeResult = "timeOutProfit"
									currentTrade.pointsCaptured = Math.abs(currentTrade.entry - candle.c)
									return
								}
							}
						}
					}
				} else if (currentTrade.tradeStatus == "exited") {
					candlePair = []
					tradesPreDay++
					results.push(currentTrade)
					currentTrade = {
						entry: 0,
						target: 0,
						stopLoss: 0,
						entryTime: "",
						exitTime: "",
						stopLossInPoints: 0,
						profitInPoints: 0,
						tradeStatus: "waitingForInfo",
						enteredSide: "",
						upsideEntryLevel: 0,
						downsideEntryLevel: 0,
						passCurrentDay: true,
						tradeResult: "",
						pointsCaptured: 0,
						pointsLost: 0,
						day: currentDay,
						month: currentCandleTime.getMonth(),
					}
				}
			}
		})
	}
	const days = {
		positive: {
			monday: results.filter((result: any) => result.day == "Monday" && result.tradeResult == "profit").length,
			tuesday: results.filter((result: any) => result.day == "Tuesday" && result.tradeResult == "profit").length,
			wednesday: results.filter((result: any) => result.day == "Wednesday" && result.tradeResult == "profit").length,
			thursday: results.filter((result: any) => result.day == "Thursday" && result.tradeResult == "profit").length,
			friday: results.filter((result: any) => result.day == "Friday" && result.tradeResult == "profit").length,
		},
		negative: {
			monday: results.filter((result: any) => result.day == "Monday" && result.tradeResult == "loss").length,
			tuesday: results.filter((result: any) => result.day == "Tuesday" && result.tradeResult == "loss").length,
			wednesday: results.filter((result: any) => result.day == "Wednesday" && result.tradeResult == "loss").length,
			thursday: results.filter((result: any) => result.day == "Thursday" && result.tradeResult == "loss").length,
			friday: results.filter((result: any) => result.day == "Friday" && result.tradeResult == "loss").length,
		},
	}
	const months = {
		positive: {
			january: results.filter((result: any) => result.month == 0 && result.tradeResult == "profit").length,
			february: results.filter((result: any) => result.month == 1 && result.tradeResult == "profit").length,
			march: results.filter((result: any) => result.month == 2 && result.tradeResult == "profit").length,
			april: results.filter((result: any) => result.month == 3 && result.tradeResult == "profit").length,
			may: results.filter((result: any) => result.month == 4 && result.tradeResult == "profit").length,
			june: results.filter((result: any) => result.month == 5 && result.tradeResult == "profit").length,
			july: results.filter((result: any) => result.month == 6 && result.tradeResult == "profit").length,
			august: results.filter((result: any) => result.month == 7 && result.tradeResult == "profit").length,
			september: results.filter((result: any) => result.month == 8 && result.tradeResult == "profit").length,
			october: results.filter((result: any) => result.month == 9 && result.tradeResult == "profit").length,
			november: results.filter((result: any) => result.month == 10 && result.tradeResult == "profit").length,
			december: results.filter((result: any) => result.month == 11 && result.tradeResult == "profit").length,
		},
		negative: {
			january: results.filter((result: any) => result.month == 0 && result.tradeResult == "loss").length,
			february: results.filter((result: any) => result.month == 1 && result.tradeResult == "loss").length,
			march: results.filter((result: any) => result.month == 2 && result.tradeResult == "loss").length,
			april: results.filter((result: any) => result.month == 3 && result.tradeResult == "loss").length,
			may: results.filter((result: any) => result.month == 4 && result.tradeResult == "loss").length,
			june: results.filter((result: any) => result.month == 5 && result.tradeResult == "loss").length,
			july: results.filter((result: any) => result.month == 6 && result.tradeResult == "loss").length,
			august: results.filter((result: any) => result.month == 7 && result.tradeResult == "loss").length,
			september: results.filter((result: any) => result.month == 8 && result.tradeResult == "loss").length,
			october: results.filter((result: any) => result.month == 9 && result.tradeResult == "loss").length,
			november: results.filter((result: any) => result.month == 10 && result.tradeResult == "loss").length,
			december: results.filter((result: any) => result.month == 11 && result.tradeResult == "loss").length,
		},
	}
	await timeout(5000)
	//save this data into json file
	fs.writeFileSync("./backtestResults.json", JSON.stringify(results))
	const numberOfTrades = results.length
	const numberOfProfitTrades = results.filter((result: any) => result.tradeResult == "profit").length
	const numberOfLossTrades = results.filter((result: any) => result.tradeResult == "loss").length
	const numberOfTimeOutProfitTrades = results.filter((result: any) => result.tradeResult == "timeOutProfit").length
	const numberOfTimeOutLossTrades = results.filter((result: any) => result.tradeResult == "timeOutLoss").length
	const totalPointsCaptured = results.reduce((acc: any, result: any) => acc + result.pointsCaptured, 0)
	const totalPointsLost = results.reduce((acc: any, result: any) => acc + result.pointsLost, 0)
	const totalProfit = totalPointsCaptured - totalPointsLost
	const totalProfitPercentage = Number(((totalProfit / funds) * 100).toFixed(2))
	const averagePointsCaptured = Number((totalPointsCaptured / numberOfTrades).toFixed(2))
	const averagePointsLost = Number((totalPointsLost / numberOfTrades).toFixed(2))
	const averageProfit = Number((totalProfit / numberOfTrades).toFixed(2))

	console.log(`Total Trades: ${numberOfTrades}`)
	console.log(`Total Profit Trades: ${numberOfProfitTrades}`)
	console.log(`Total Loss Trades: ${numberOfLossTrades}`)
	console.log(`Total TimeOut Profit Trades: ${numberOfTimeOutProfitTrades}`)
	console.log(`Total TimeOut Loss Trades: ${numberOfTimeOutLossTrades}`)
	console.log(`Total Points Captured: ${totalPointsCaptured}`)
	console.log(`Total Points Lost: ${totalPointsLost}`)
	console.log(`Total Profit: ${totalProfit}`)
	console.log(`Total Profit Percentage: ${totalProfitPercentage}`)
	console.log(`Average Points Captured: ${averagePointsCaptured}`)
	console.log(`Average Points Lost: ${averagePointsLost}`)
	console.log(`Average Profit: ${averageProfit}`)
	console.log(days)
	console.log(months)
}
