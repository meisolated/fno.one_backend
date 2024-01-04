import { Schema } from "mongoose"

export default new Schema<iTrade>(
	{
		positionId: { type: Number, required: true, unique: false },
		userId: { type: String, required: true, unique: false },
		id: { type: String, required: true, unique: false },
		exchange: { type: String, required: true, unique: false },
		exchangeOrderNo: { type: String, required: true, unique: false },
		orderDateTime: { type: String, required: true, unique: false },
		orderNumber: { type: String, required: true, unique: false },
		productType: { type: String, required: true, unique: false },
		segment: { type: Number, required: true, unique: false },
		side: { type: Number, required: true, unique: false },
		symbol: { type: String, required: true, unique: false },
		tradeNumber: { type: String, required: true, unique: false },
		tradePrice: { type: Number, required: true, unique: false },
		tradeValue: { type: Number, required: true, unique: false },
		tradedQty: { type: Number, required: true, unique: false },
		createdAt: { type: Number, required: true, default: Date.now },
		updatedAt: { type: Number, required: true, default: Date.now },
	},
	{
		timestamps: true,
	},
)
