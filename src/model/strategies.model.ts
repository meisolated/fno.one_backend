import { Schema } from "mongoose"

export default new Schema<iStrategies>(
	{
		id: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: false },
		markets: [{ type: String, required: false }],
		enabled: { type: Boolean, required: true },
		backTest: {
			lastBackTested: { type: String, required: false },
			backTestData: { type: String, required: false },
		},
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
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
