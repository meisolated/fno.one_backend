import { Schema } from "mongoose"

export default new Schema<iMarketData>(
	{
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
	},
	{
		timestamps: {
			createdAt: "createdAt",
			updatedAt: "updatedAt",
			currentTime: () => {
				const date = new Date()
				const options = { timeZone: "Asia/Kolkata" }
				const formattedDate = date.toLocaleString("en-US", options)
				return new Date(formattedDate).getTime()
			},
		},
		toJSON: {
			getters: true,
			virtuals: false,
			transform: function (doc, ret) {
				ret.createdAt = new Date(ret.createdAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
				ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
				return ret
			},
		},
		toObject: {
			getters: true,
			virtuals: false,
			transform: function (doc, ret) {
				ret.createdAt = new Date(ret.createdAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
				ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
				return ret
			},
		},
	},
)
