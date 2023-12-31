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

function candleStickPatter() {}

async function main() {}
main()
