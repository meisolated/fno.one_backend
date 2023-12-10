import logger from "../logger"
import { Settings } from "../model"

let settings: iSettings

const checkIsConfigured = async () => {
	const settings = await Settings.findOne({ id: 1 })
	if (!settings) {
		return false
	}
	return true
}
const initializeEmptySettings = async () => {
	const settingsSettings: iSettings = {
		id: 1,
		enableLogging: true,
		keepRealTimeMarketsData: false,
		activeStrategies: [],
		developmentMode: true,
		global: {
			maxProfit: 30,
			maxLoss: 10,
			maxTradesPerDay: 3,
			enableMoneyManager: true,
			orderPlacementSettings: {
				orderType: 1,
				productType: "INTRADAY",
			}
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
				webhookSecret: "",
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
		tasksLastRun: {},
		lastUpdated: new Date(),
	}

	try {
		await Settings.create(settings)
		logger.info("Empty Settings Initialized", "Config/initialize.ts")
		logger.info("Please configure the settings and restart the server")
		process.exit(0)
	} catch (error) {
		logger.error(JSON.stringify(error), "Config/initialize.ts")
		return false
	}
}
const initializeConfig = async () => {
	const isConfigured = await checkIsConfigured()
	if (!isConfigured) {
		const isInitialized = await initializeEmptySettings()
		if (!isInitialized) {
			logger.error("Failed to initialize empty settings", "Config/initialize.ts")
			return false
		}
		return true
	}
}
const getConfig = async () => {
	const _settings = await Settings.findOne({ id: 1 })
	if (!_settings) {
		logger.error("Settings not found", "Config/initialize.ts")
		return
	}
	settings = _settings.toObject()
}
const getConfigData = () => settings

export { getConfig, getConfigData, initializeConfig }
