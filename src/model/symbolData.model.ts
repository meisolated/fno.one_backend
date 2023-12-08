import { Schema } from "mongoose"

export default new Schema<iSymbolData>({
	trueDataSymbolId: { type: String, required: true, unique: true },
	symbol: { type: String, required: true },
	fyersSymbol: { type: String, required: false },
	kiteSymbol: { type: String, required: false },
	trueDataSymbol: { type: String, required: true },
	ltp: { type: Number, required: false },
	lastUpdated: { type: Date, required: true },
})
