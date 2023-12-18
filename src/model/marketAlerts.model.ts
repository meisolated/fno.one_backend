import { Schema } from "mongoose"

export default new Schema<iMarketAlerts>(
	{
		userId: { type: String, required: true },
		symbol: { type: String, required: true },
		condition: { type: String, required: true }, // "greaterThan" | "lessThan" | "crossesAbove" | "crossesBelow"
		value: { type: Number, required: true },
		alerted: { type: Boolean, required: true },
	},
	{
		timestamps: true,
	},
)
