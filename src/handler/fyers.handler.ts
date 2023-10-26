import { getConfigData } from "../config/initialize"
import { timeout } from "../helper"
import { getProfile } from "../lib/fyers"
import FyersOrderSocket from "../lib/fyers/orderUpdateSocketV3"
import logger from "../logger"
import { User } from "../model"

export const subscribeToAllUsersSockets = async () => {
	// let retryCount = 0
	const subscribeToFyersUserSocket = async () => {
		const user = await User.findOne({ email: "fisolatedx@gmail.com" })
		if (user) {
			const config = getConfigData()
			const accessToken = user?.userAppsData.fyers.accessToken
			const appId = config.apis.fyers.appId
			const userProfileData = await getProfile(accessToken)
			if (userProfileData.code == 200) {
				const orderSocketConnection = new FyersOrderSocket(`${appId}:${accessToken}`, false, true)
				await orderSocketConnection.connect()
				await timeout(1000)
				return orderSocketConnection.isConnected()
			} else {
				logger.error("AccessToken probably expired", "fyers.handler")
				return false
			}
		} else {
			logger.error("User not found", "fyers.handler")
			return false
		}
	}
	const subscribeInterval: any = setInterval(async () => {
		// retryCount++
		// if (retryCount > 10) return clearInterval(subscribeInterval)
		const connected = await subscribeToFyersUserSocket()
		if (connected) {
			clearInterval(subscribeInterval)
			logger.info("Subscribed to Fyers User Socket", "fyers.handler")
		}
	}, 8000)
}
