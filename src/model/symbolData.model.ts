import { Schema } from "mongoose"

export default new Schema<symbolData>({
    symbol: { type: String, required: true, unique: true },
    fyersSymbol: { type: String, required: false },
    kiteSymbol: { type: String, required: false },
    trueDataSymbol: { type: String, required: false },
    ltp: { type: Number, required: true },
    lastUpdated: { type: Date, required: true },
})
