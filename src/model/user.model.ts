import { Schema } from "mongoose"

export default new Schema<iUser>(
	{
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		displayName: { type: String, required: true },
		image: { type: String, required: false },
		pan: { type: String, required: false },
		status: { type: Boolean, required: true },
		roles: [{ type: String, required: true }],
		lastLogin: { type: Date, required: true },
		loggedIn: { type: Boolean, required: true },
		connectedApps: [{ type: String, required: false }],
		apps: [{ type: String, required: false }],
		riskManager: {
			numberOfTradesAllowedPerDay: { type: Number, required: false },
			takeControlOfManualTrades: { type: Boolean, required: false },
			percentageOfMaxProfitPerDay: { type: Number, required: false },
			percentageOfMaxLossPerDay: { type: Number, required: false },
		},
		funds: {
			fyers: {
				available: { type: Number, required: false },
				used: { type: Number, required: false },
				total: { type: Number, required: false },
			},
		},
		moneyManager: {
			fundsToUse: { type: String, required: false },
		},
		positionTypeSettings: {
			long: {
				quantity: { type: Number, required: false },
				preferredOptionPrice: { type: String, required: false },
				riskToRewardRatio: { type: String, required: false },
				stopLoss: { type: String, required: false },
			},
			scalping: {
				quantity: { type: Number, required: false },
				preferredOptionPrice: { type: String, required: false },
				riskToRewardRatio: { type: String, required: false },
				stopLoss: { type: String, required: false },
			},
			swing: {
				quantity: { type: Number, required: false },
				preferredOptionPrice: { type: String, required: false },
				riskToRewardRatio: { type: String, required: false },
				stopLoss: { type: String, required: false },
			},
			expiry: {
				quantity: { type: Number, required: false },
				preferredOptionPrice: { type: String, required: false },
				riskToRewardRatio: { type: String, required: false },
				stopLoss: { type: String, required: false },
			},
		},
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
	{
		timestamps: true,
	},
)
