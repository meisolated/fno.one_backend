import logger from "../logger"
import { Settings } from "../model"

let settings: settings

const checkIsConfigured = async () => {
	const settings = await Settings.findOne({ id: 1 })
	if (!settings) {
		return false
	}
	return true
}
const initializeEmptySettings = async () => {
	const settings: settings = {
		id: 1,
		realTimeMarketsToWatch: [],
		keepRealTimeMarketsData: false,
		activeStrategies: [],
		global: {
			maxProfit: 30,
			maxLoss: 10,
			maxTradesPerDay: 3,
			enableMoneyManager: true,
		},
		serverConf: {
			APIPort: 0,
			socketPort: 0,
			SMTP: {
				host: "",
				port: 0,
				secure: false,
				auth: {
					user: "",
					pass: "",
				},
			},
		},
		apis: {
			fyers: {
				appId: "",
				secretId: "",
				redirectUrl: "",
				callbackSecret: "",
				apiUrl: "",
				webSocketUrl: "",
				dataApiUrl: "",
				status: false,
			},
			kite: {
				apiKey: "",
				apiSecret: "",
				redirectUrl: "",
				apiUrl: "",
				webSocketUrl: "",
				dataApiUrl: "",
				status: false,
			},
			trueData: {
				username: "",
				password: "",
				status: false,
				socketUrl: "",
				replySocketUrl: "",
			},
			NSE: {
				OptionQuoteDerivativeAPIUrl: "",
				OptionChainDataAPIUrl: "",
				HolidaysAPIUrl: "",
			},
		},

		lastUpdated: new Date(),
	}

	try {
		await Settings.create(settings)
		logger.info("Empty Settings Initialized")
		logger.info("Please configure the settings and restart the server")
		process.exit(0)
		return true
	} catch (error) {
		logger.error(JSON.stringify(error))
		return false
	}
}
const initializeConfig = async () => {
	const isConfigured = await checkIsConfigured()
	if (!isConfigured) {
		const isInitialized = await initializeEmptySettings()
		if (!isInitialized) {
			logger.error("Failed to initialize empty settings")
			return false
		}
		return true
	}
}
const getConfig = async () => {
	const _settings = await Settings.findOne({ id: 1 })
	if (!_settings) {
		logger.error("Settings not found")
		return
	}
	settings = _settings.toObject()
}
const getConfigData = () => settings

export { getConfig, getConfigData, initializeConfig }
