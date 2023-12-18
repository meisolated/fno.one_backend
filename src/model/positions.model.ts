import { Schema } from "mongoose"
import { getNextSequenceValue } from "."

// things we need to add in this model
// remainingQuantity: { type: Number, required: true, default: 0 },
// averagePrice: { type: Number, required: true, default: 0 },
// filledQuantity: { type: Number, required: true, default: 0 },
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
		enteredAt: { type: Number, required: true, default: new Date().getTime() },
		exitedAt: { type: Number, required: true, default: new Date().getTime() },
		createdAt: { type: Number, required: true, default: new Date().getTime() },
		updatedAt: { type: Number, required: true, default: new Date().getTime() },
	},
	{
		timestamps: true,
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
