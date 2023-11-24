import { Schema } from "mongoose"

export default new Schema<iStrategies>(
	{
		id: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: false },
		markets: [{ type: String, required: false }],
		enabled: { type: Boolean, required: true },
		backTest: {
			lastBackTested: { type: String, required: false },
			backTestData: { type: String, required: false },
		},
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ timestamps: true },
)
