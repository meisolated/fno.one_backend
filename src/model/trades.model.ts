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
		side: { type: String, required: true, unique: false },
		symbol: { type: String, required: true, unique: false },
		tradeNumber: { type: String, required: true, unique: false },
		tradePrice: { type: Number, required: true, unique: false },
		tradeValue: { type: Number, required: true, unique: false },
		tradedQty: { type: Number, required: true, unique: false },
	},
	{ timestamps: true },
)
