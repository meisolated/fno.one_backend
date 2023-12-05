import { Schema } from "mongoose"
import { getNextSequenceValue } from "."

const positions = new Schema<iPosition>(
	{
		id: { type: Number, unique: true, index: true },
		userId: { type: String, required: true, unique: false },
		paper: { type: Boolean, required: true, default: false },
		whichBroker: { type: String, required: true, default: "user" },
		side: { type: String, required: true, default: "1" },
		price: { type: Number, required: true, default: 0 },
		quantity: { type: Number, required: true, default: 0 },
		stopLoss: { type: Number, required: true, default: 0 },
		peakLTP: { type: Number, required: true, default: 0 },
		trailingStopLoss: { type: Boolean, required: true, default: true },
		riskToRewardRatio: { type: Number, required: true, default: 0 },
		orderType: { type: Number, required: true, default: 1 },
		productType: { type: String, required: true, default: "INTRADAY" },
		positionType: { type: String, required: true, default: "long" },
		madeBy: { type: String, required: true, default: "user" },
		strategyName: { type: String, required: true, default: "user" },
		orderStatus: { type: Number, required: true, default: 6 },
		status: { type: String, required: true, default: "created" },
		message: { type: String, required: true, default: "created" },
	},
	{ timestamps: true },
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
