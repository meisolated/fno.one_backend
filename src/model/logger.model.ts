import { Schema } from "mongoose"

export default new Schema<iLogger>({
	message: { type: String, required: true },
	type: { type: String, required: true },
	by: { type: String, required: true },
	user: { type: String, required: false },
	timestamp: { type: Date, required: true },
	loggedFrom: { type: String, required: true },
})
