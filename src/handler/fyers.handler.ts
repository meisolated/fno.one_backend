import { getConfigData } from "../config/initialize"
import FyersOrderSocket from "../lib/fyers/orderUpdateSocketV3"
import logger from "../logger"
import { User } from "../model"


export const subscribeToAllUsersSockets = async () => {
	const user = await User.findOne({ email: "fisolatedx@gmail.com" })
	if (user) {
		const config = getConfigData()
		const accessToken = user?.userAppsData.fyers.accessToken
		const appId = config.apis.fyers.appId
		const fyersOrderSocket = new FyersOrderSocket(`${appId}:${accessToken}`, true, true)
	} else {
		logger.error("User not found", "fyers.handler")
	}
}
