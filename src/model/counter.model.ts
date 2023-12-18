import { Schema } from "mongoose"

export default new Schema<any>(
	{
		_id: { type: String, required: true },
		sequenceValue: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	},
)
