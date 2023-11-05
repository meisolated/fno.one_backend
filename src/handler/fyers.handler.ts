import { getConfigData } from "../config/initialize"
import { timeout } from "../helper"
import { getFunds, getProfile } from "../lib/broker/fyers"
import FyersOrderSocket from "../lib/broker/fyers/orderUpdateSocketV3"
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

export const updateUserBrokerFunds = async (user: user) => {
	const userFyersFunds = await getFunds(user.userAppsData.fyers.accessToken)
	//update user funds
	user.funds.fyers.total = userFyersFunds.fund_limit.filter((fund: any) => fund.id === 1)[0].equityAmount.toFixed(2)
	user.funds.fyers.available = userFyersFunds.fund_limit.filter((fund: any) => fund.id === 10)[0].equityAmount.toFixed(2)
	user.funds.fyers.used = userFyersFunds.fund_limit.filter((fund: any) => fund.id === 2)[0].equityAmount.toFixed(2)
	//money manager
	user.moneyManager.fundsToUse = parseFloat(((user.funds.fyers.available * user.moneyManager.percentageOfFundsToUse) / 100).toFixed(2))
	user.moneyManager.weekDays.monday.fundsToUse = parseFloat((((user.moneyManager.fundsToUse * user.moneyManager.weekDays.monday.percentageOfFundsToUse) / 100)).toFixed(2))
	await User.findOneAndUpdate(user)
	return userFyersFunds
}
