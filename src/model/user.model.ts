import { Schema } from "mongoose"

export default new Schema<user>(
	{
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		displayName: { type: String, required: true },
		image: { type: String, required: false },
		pan: { type: String, required: false },
		status: { type: String, required: true },
		roles: [{ type: String, required: true }],
		settings: {
			stopLoss: { type: Number, required: false },
			takeProfit: { type: Number, required: false },
			activeStrategies: [{ type: String, required: false }],
			dailyTrades: { type: Number, required: false },
		},
		lastLogin: { type: Date, required: true },
		loggedIn: { type: Boolean, required: true },
		connectedApps: [{ type: String, required: false }],
		apps: [{ type: String, required: false }],
		userAppsData: {
			fyers: {
				accessToken: { type: String, required: false },
				refreshToken: { type: String, required: false },
				Id: { type: String, required: false },
				loggedIn: { type: Boolean, required: false },
				loggedInTime: { type: Date, required: false },
				lastUpdates: {
					orders: { type: Date, required: false },
					trades: { type: Date, required: false },
					positions: { type: Date, required: false },
					holdings: { type: Date, required: false },
					margins: { type: Date, required: false },
					profile: { type: Date, required: false },
					marketStatus: { type: Date, required: false },
					marketDepth: { type: Date, required: false },
					marketFeed: { type: Date, required: false },
				},
			},
		},
	},
	{ timestamps: true },
)
