import { Schema } from "mongoose"
import { getNextSequenceValue } from "."

const positions = new Schema<iPosition>(
	{
		id: { type: Number, unique: true, index: true },
		userId: { type: String, required: true, unique: false },
		paper: { type: Boolean, required: true, default: false },
		whichBroker: { type: String, required: true, default: "user" },
		symbol: { type: String, required: true, default: "user" },
		side: { type: Number, required: true, default: 1 },
		price: { type: Number, required: true, default: 0 },
		quantity: { type: Number, required: true, default: 0 },
		stopLoss: { type: Number, required: true, default: 0 },
		peakLTP: { type: Number, required: true, default: 0 },
		trailingStopLoss: { type: Number, required: true, default: 0 },
		riskToRewardRatio: { type: Number, required: true, default: 0 },
		orderType: { type: Number, required: true, default: 1 },
		productType: { type: String, required: true, default: "INTRADAY" },
		positionType: { type: String, required: true, default: "long" },
		realizedProfit: { type: Number, required: true, default: 0 },
		unRealizedProfit: { type: Number, required: true, default: 0 },
		madeBy: { type: String, required: true, default: "user" },
		strategyName: { type: String, required: true, default: "user" },
		orderStatus: { type: Number, required: true, default: 6 },
		status: { type: String, required: true, default: "created" },
		message: { type: String, required: true, default: "created" },
		enteredAt: { type: Number, required: true, default: 0 },
		exitedAt: { type: Number, required: true, default: 0 },
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

positions.pre("save", async function (next) {
	if (!this.isNew) {
		next()
		return
	}
	if (!this.id) {
		this.id = await getNextSequenceValue("positions")
	}
	next()
})

export default positions
