import { Schema } from "mongoose"

export default new Schema<trades>({
	id: { type: String, required: true },
	clientId: { type: String, required: true },
	exchange: { type: String, required: true },
	exchangeOrderNo: { type: String, required: true },
	fyToken: { type: String, required: true },
	orderDateTime: { type: String, required: true },
	orderNumber: { type: String, required: true },
	orderType: { type: Number, required: true },
	productType: { type: String, required: true },
	row: { type: Number, required: true },
	segment: { type: String, required: true },
	side: { type: Number, required: true },
	symbol: { type: String, required: true },
	tradeNumber: { type: String, required: true },
	tradePrice: { type: Number, required: true },
	tradeValue: { type: Number, required: true },
	tradedQty: { type: Number, required: true },
	madeBy: { type: String, required: true },
	strategyName: { type: String, required: false },
	createdAt: { type: Date, required: true },
	updatedAt: { type: Date, required: true },
})
