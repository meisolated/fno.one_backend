import { Schema } from "mongoose"

export default new Schema<symbolData>({
	trueDataSymbolId: { type: String, required: false, unique: true },
	symbol: { type: String, required: true, unique: true },
	fyersSymbol: { type: String, required: false },
	kiteSymbol: { type: String, required: false },
	trueDataSymbol: { type: String, required: false },
	ltp: { type: Number, required: false },
	lastUpdated: { type: Date, required: true },
})
