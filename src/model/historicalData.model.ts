import { Schema } from "mongoose"

export default new Schema<iHistoricalData>(
	{
		symbol: { type: String, require: true },
		resolution: { type: String, require: true },
		t: { type: Number, required: true },
		o: { type: Number, required: true },
		h: { type: Number, required: true },
		l: { type: Number, required: true },
		c: { type: Number, required: true },
		v: { type: Number, required: true },
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
