import { HistoricalData } from "../../model"

export default async () => {
	const historicalData = await HistoricalData.find({}).lean()
}
