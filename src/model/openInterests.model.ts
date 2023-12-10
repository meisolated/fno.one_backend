import { Schema } from "mongoose"

export default new Schema<iOpenInterest>(
	{
		symbol: { type: String, required: true },
		strikePrice: { type: Number, required: true },
		expiryDate: { type: Date, required: true },
		timestamp: { type: Number, required: true },
		CE: {
			askPrice: { type: Number, required: false },
			askQty: { type: Number, required: false },
			bidPrice: { type: Number, required: false },
			bidQty: { type: Number, required: false },
			change: { type: Number, required: false },
			changeInOpenInterest: { type: Number, required: false },
			expiryDate: { type: Date, required: false },
			identifier: { type: String, required: false },
			impliedVolatility: { type: Number, required: false },
			lastPrice: { type: Number, required: false },
			openInterest: { type: Number, required: false },
			pChange: { type: Number, required: false },
			pChangeInOpenInterest: { type: Number, required: false },
			strikePrice: { type: Number, required: false },
			totalBuyQuantity: { type: Number, required: false },
			totalSellQuantity: { type: Number, required: false },
			totalTradedVolume: { type: Number, required: false },
			underlyingValue: { type: Number, required: false },
			underlying: { type: String, required: false },
		},
		PE: {
			askPrice: { type: Number, required: false },
			askQty: { type: Number, required: false },
			bidPrice: { type: Number, required: false },
			bidQty: { type: Number, required: false },
			change: { type: Number, required: false },
			changeInOpenInterest: { type: Number, required: false },
			expiryDate: { type: Date, required: false },
			identifier: { type: String, required: false },
			impliedVolatility: { type: Number, required: false },
			lastPrice: { type: Number, required: false },
			openInterest: { type: Number, required: false },
			pChange: { type: Number, required: false },
			pChangeInOpenInterest: { type: Number, required: false },
			strikePrice: { type: Number, required: false },
			totalBuyQuantity: { type: Number, required: false },
			totalSellQuantity: { type: Number, required: false },
			totalTradedVolume: { type: Number, required: false },
			underlyingValue: { type: Number, required: false },
			underlying: { type: String, required: false },
		},
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
