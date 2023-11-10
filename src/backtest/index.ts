import moment from "moment"
import { HistoricalData } from "../model"

const getLast12MonthsUnixTimestamps = () => {
	const sixMonthsBefore = moment().subtract(12, "months").unix()
	const now = moment().unix()
	return { sixMonthsBefore, now }
}

const getLast12MonthsHistoricalDataIn1Min = async () => {
	const { sixMonthsBefore, now } = getLast12MonthsUnixTimestamps()
	const last12MonthsHistoricalDataIn1Min = await HistoricalData.find({ resolution: "1", t: { $gte: sixMonthsBefore, $lte: now } }).lean()
	return last12MonthsHistoricalDataIn1Min
}
const decideSide = (candle: any) => {
	const colorOfTheCandle = candle.c > candle.o ? "green" : "red"
	return colorOfTheCandle === "green" ? "long" : "short"
	// const bodySize = Math.abs(candle.c - candle.o)
	// const wickSize = Math.abs(candle.h - candle.l) - bodySize
	// const candleSize = bodySize + wickSize
	// const bodySizePercentage = (bodySize / candleSize) * 100
	// const wickSizePercentage = (wickSize / candleSize) * 100
	// // decide side logic
	// if (colorOfTheCandle === "green") {
	//     if (bodySizePercentage > 80 && wickSizePercentage < 20) {
	//         return "long"
	//     } else {
	//         return "no-trade"
	//     }
	// } else {
	//     if (bodySizePercentage > 80 && wickSizePercentage < 20) {
	//         return "short"
	//     } else {
	//         return "no-trade"
	//     }
	// }
}

const executeStrategy = async () => {
	const last12MonthsHistoricalDataIn1Min = await getLast12MonthsHistoricalDataIn1Min()
	const sortedLast12MonthsHistoricalDataIn1Min = last12MonthsHistoricalDataIn1Min.sort((a, b) => a.t - b.t)

	// -----------------| Strategy |-----------------

	const maxStopLoss = 60
	const minTarget = 180
	const trailingAfter = 60
	const entryTimings = ["09:16", "12:00"]
	let currentDay = ""
	let totalProfitableDays = 0
	let totalLossDays = 0
	let currentOnGoingTrade = {
		inPosition: false,
		entryPrice: 0,
		stopLoss: 0,
		target: 0,
		trailingStopLoss: 0,
		trailingStopLossActive: false,
		trailingStopLossActivateLevel: 0,
		side: "",
	}
	let numberOfTrades = 0
	sortedLast12MonthsHistoricalDataIn1Min.map((candle, index) => {
		const { t, o, h, l, c } = candle
		const currentDayDate = moment.unix(t).format("DD-MM-YYYY")
		const currentDayTime = moment.unix(t).format("HH:mm")
		if (currentDayDate !== currentDay) {
			currentDay = currentDayDate
			if (currentOnGoingTrade.inPosition) {
				const previousCandle = sortedLast12MonthsHistoricalDataIn1Min[index - 1]
				const { t, o, h, l, c: _c } = previousCandle
			}
		}
		if (currentOnGoingTrade.inPosition) {
		} else {
			if (entryTimings.includes(currentDayTime)) {
				if (Math.abs(o - c) > 60) return
				const decideSideResult = decideSide(candle)
			}
		}
		if (index === sortedLast12MonthsHistoricalDataIn1Min.length - 1) {
			console.log("totalProfitableDays", totalProfitableDays)
			console.log("totalLossDays", totalLossDays)
		}
	})
}

executeStrategy()
