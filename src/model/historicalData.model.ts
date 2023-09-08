import { Schema } from "mongoose"

export default new Schema<historicalData>(
	{
		symbol: { type: String, require: true },
		resolution: { type: String, require: true },
		t: { type: String, required: true },
		o: { type: String, required: true },
		h: { type: String, required: true },
		l: { type: String, required: true },
		c: { type: String, required: true },
		v: { type: String, required: true },
	},
	{ timestamps: true },
)
