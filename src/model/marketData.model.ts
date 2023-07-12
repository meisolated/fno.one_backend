import { Schema } from "mongoose"

export default new Schema<marketData>({
	id: { type: String, required: false, unique: true },
	BANKNIFTY: {
		derivativeName: { type: String, required: false },
		expiryDates: [{ type: String, required: false }],
		strikePrices: [{ type: Number, required: false }],
		lastUpdateTime: { type: String, required: false },
	},
	FINNIFTY: {
		derivativeName: { type: String, required: false },
		expiryDates: [{ type: String, required: false }],
		strikePrices: [{ type: Number, required: false }],
		lastUpdateTime: { type: String, required: false },
	},
	NIFTY: {
		derivativeName: { type: String, required: false },
		expiryDates: [{ type: String, required: false }],
		strikePrices: [{ type: Number, required: false }],
		lastUpdateTime: { type: String, required: false },
	},

	FnOHolidayList: [
		{
			holidayDate: { type: String, required: false },
			weekDay: { type: String, required: false },
			description: { type: String, required: false },
		},
	],
	lastUpdated: { type: Number, required: false },
})
