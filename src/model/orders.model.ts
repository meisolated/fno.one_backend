import { Schema } from "mongoose"

export default new Schema<iOrder>(
	{
		positionId: { type: Number, required: true, unique: false },
		orderDateTime: { type: String, required: false, unique: false },
		orderId: { type: String, required: false, unique: true },
		exchOrdId: { type: String, required: false, unique: false },
		side: { type: Number, required: false, unique: false },
		segment: { type: Number, required: false, unique: false },
		instrument: { type: String, required: false, unique: false },
		productType: { type: String, required: false, unique: false },
		status: { type: Number, required: false, unique: false },
		quantity: { type: Number, required: false, unique: false },
		remainingQuantity: { type: Number, required: false, unique: false },
		filledQuantity: { type: Number, required: false, unique: false },
		limitPrice: { type: Number, required: false, unique: false },
		stopPrice: { type: Number, required: false, unique: false },
		orderType: { type: Number, required: false, unique: false },
		discloseQty: { type: Number, required: false, unique: false },
		dqQtyRem: { type: Number, required: false, unique: false },
		orderValidity: { type: String, required: false, unique: false },
		source: { type: String, required: false, unique: false },
		slNo: { type: Number, required: false, unique: false },
		fyToken: { type: String, required: false, unique: false },
		offlineOrder: { type: Boolean, required: false, unique: false },
		message: { type: String, required: false, unique: false },
		orderNumStatus: { type: String, required: false, unique: false },
		tradedPrice: { type: Number, required: false, unique: false },
		exchange: { type: Number, required: false, unique: false },
		pan: { type: String, required: false, unique: false },
		clientId: { type: String, required: false, unique: false },
		symbol: { type: String, required: false, unique: false },
		ch: { type: String, required: false, unique: false },
		chp: { type: String, required: false, unique: false },
		lp: { type: String, required: false, unique: false },
		ex_sym: { type: String, required: false, unique: false },
		description: { type: String, required: false, unique: false },
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
