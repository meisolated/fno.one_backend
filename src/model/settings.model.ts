import { Schema } from "mongoose"

export default new Schema<settings>(
	{
		id: { type: Number, required: false, unique: true },
		state: { type: String, required: false },
		simulateTicks: { type: Boolean, required: false },
		enableLogging: { type: Boolean, required: false },
		realTimeMarketsToWatch: [{ type: String, required: false }],
		keepRealTimeMarketsData: { type: Boolean, required: false },
		activeStrategies: [{ type: String, required: false }],
		primaryFyersAccountEmail: { type: String, required: false },
		global: {
			maxProfit: { type: Number, required: false },
			maxLoss: { type: Number, required: false },
			maxTradesPerDay: { type: Number, required: false },
			enableRiskManager: { type: Boolean, required: false },
			enableMoneyManager: { type: Boolean, required: false },
		},
		serverConf: {
			APIPort: { type: Number, required: false },
			socketPort: { type: Number, required: false },
			SMTP: {
				host: { type: String, required: false },
				port: { type: Number, required: false },
				secure: { type: Boolean, required: false },
				auth: {
					user: { type: String, required: false },
					pass: { type: String, required: false },
				},
			},
		},
		apis: {
			fyers: {
				appId: { type: String, required: false },
				secretId: { type: String, required: false },
				redirectUrl: { type: String, required: false },
				callbackSecret: { type: String, required: false },
				apiUrl: { type: String, required: false },
				webSocketUrl: { type: String, required: false },
				dataApiUrl: { type: String, required: false },
				status: { type: Boolean, required: false },
				webhookSecret: { type: String, required: false },
			},
			kite: {
				apiKey: { type: String, required: false },
				apiSecret: { type: String, required: false },
				redirectUrl: { type: String, required: false },
				apiUrl: { type: String, required: false },
				webSocketUrl: { type: String, required: false },
				dataApiUrl: { type: String, required: false },
				status: { type: Boolean, required: false },
			},
			trueData: {
				username: { type: String, required: false },
				password: { type: String, required: false },
				status: { type: Boolean, required: false },
				socketUrl: { type: String, required: false },
				replySocketUrl: { type: String, required: false },
			},
			NSE: {
				OptionQuoteDerivativeAPIUrl: { type: String, required: false },
				OptionChainDataAPIUrl: { type: String, required: false },
				HolidaysAPIUrl: { type: String, required: false },
			},
		},
		tasksLastRun: {
			symbolMasterDataUpdate: { type: Date, required: false },
		},
		lastUpdated: { type: Date, required: false },
	},
	{ timestamps: true },
)
