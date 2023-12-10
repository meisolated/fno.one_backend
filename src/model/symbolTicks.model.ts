import { Schema } from "mongoose"

export default new Schema<iSymbolTicks>(
	{
		highPrice: { type: Number },
		prevClosePrice: { type: Number },
		ch: { type: Number },
		tt: { type: Number },
		description: { type: String },
		shortName: { type: String },
		exchange: { type: String },
		lowPrice: { type: Number },
		cmd: {
			c: { type: Number },
			h: { type: Number },
			l: { type: Number },
			o: { type: Number },
			t: { type: Number },
			v: { type: Number },
			tf: { type: String },
		},
		originalName: { type: String },
		chp: { type: Number },
		openPrice: { type: Number },
		lp: { type: Number },
		symbol: { type: String },
		LTQ: { type: Number },
		L2LTT: { type: Number },
		ATP: { type: Number },
		volume: { type: Number },
		totBuy: { type: Number },
		totSell: { type: Number },
		bid: { type: Number },
		ask: { type: Number },
		spread: { type: Number },
		marketStat: { type: Number },
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
