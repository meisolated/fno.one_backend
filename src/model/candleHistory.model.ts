import { Schema } from "mongoose"

export default new Schema<marketHistory>(
	{
		symbol: { type: String, require: true },
		resolution: { type: String, require: true },
		t: { type: Number, required: true },
		o: { type: Number, required: true },
		h: { type: Number, required: true },
		l: { type: Number, required: true },
		c: { type: Number, required: true },
		v: { type: Number, required: true },
	},
	{ timestamps: true },
)
