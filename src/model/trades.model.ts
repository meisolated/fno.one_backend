import { Schema } from "mongoose"

export default new Schema<iTrade>(
	{
		positionId: { type: String, required: true, unique: false },
		userId: { type: String, required: true, unique: false },
		id: { type: String, required: true, unique: false },
		clientId: { type: String, required: true, unique: false },
		exchange: { type: String, required: true, unique: false },
		exchangeOrderNo: { type: String, required: true, unique: false },
		brokerToken: { type: String, required: true, unique: false },
		orderDateTime: { type: String, required: true, unique: false },
		orderNumber: { type: String, required: true, unique: false },
		orderType: { type: Number, required: true, unique: false },
		productType: { type: String, required: true, unique: false },
		row: { type: Number, required: true, unique: false },
		segment: { type: String, required: true, unique: false },
		side: { type: Number, required: true, unique: false },
		symbol: { type: String, required: true, unique: false },
		tradeNumber: { type: String, required: true, unique: false },
		tradePrice: { type: Number, required: true, unique: false },
		tradeValue: { type: Number, required: true, unique: false },
		tradedQty: { type: Number, required: true, unique: false },
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
