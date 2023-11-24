import { Schema } from "mongoose"

export default new Schema<iSession>(
	{
		session: { type: String, required: true },
		expires: { type: Number, required: true },
		userId: { type: String, required: true },
	},
	{ timestamps: true },
)
