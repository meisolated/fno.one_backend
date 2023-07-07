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
            maxProfit: 0,
            maxLoss: 0,
            maxTradesPerDay: 0,
            enableMoneyManager: false,
        },
        userLimit: 0,
        fyers: {
            appId: "",
            secretId: "",
            redirectUrl: "",
            callbackSecret: "",
            apiUrl: "",
            dataApiUrl: "",
            webSocketUrl: "",
        },
        fyersTrueData: {
            username: "",
            password: "",
        },
        NSEApi: {
            NSEOptionQuoteDerivativeAPIUrl: "",
            NSEOptionChainDataAPIUrl: "",
        },
        lastUpdated: new Date(),
    }

    try {
        await Settings.create(settings)
        logger.info("Empty Settings Initialized")
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

const getConfigData = () => {
    return settings
}

export { getConfig, getConfigData, initializeConfig }

