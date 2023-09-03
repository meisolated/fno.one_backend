import { getConfigData } from "../config/initialize"
import chatter from "../events"
import * as fyers from "../lib/fyers"
import { getSHA256Hash } from "../lib/fyers/helper"
import FyersOrderSocket from "../lib/fyers/orderUpdateSocketv3"
import logger from "../logger"
import { Session, User } from "../model"
import orderUpdateHandler from "./orderUpdate.handler"

const connectionToOrderUpdateSocket = new fyers.orderUpdateSocket()

export const subscribeToAllUsersSockets = async () => {
	const user = await User.findOne({ email: "fisolatedx@gmail.com" })
	if (user) {
		const config = getConfigData()
		const accessToken = user?.userAppsData.fyers.accessToken
		const appId = config.apis.fyers.appId
		const fyersOrderSocket = new FyersOrderSocket(`${appId}:${accessToken}`, true, true)

	} else {
		logger.error("User not found")
	}



	// const activeUsersSocketConnection: Array<any> = []

	// function connectSocket(user: any) {
	// 	if (user.connectedApps.includes("fyers")) {
	// 		logger.info("We were able to connect this user to fyers api with access token " + user.email)
	// 		fyers.getProfile(user.userAppsData.fyers.accessToken).then(async (profile) => {
	// 			if (profile.code === 200) {
	// 				const userSession = await Session.findOne({ userId: user._id })
	// 				if (userSession) {
	// 					activeUsersSocketConnection.push(userSession.userId)
	// 					connectionToOrderUpdateSocket.onOrderUpdate(
	// 						user.userAppsData.fyers.accessToken,
	// 						(data: any) => {
	// 							const letData = JSON.parse(data)
	// 							if (letData.s == "ok") {
	// 								orderUpdateHandler(userSession.userId, letData.d)
	// 								// chatter.emit("fyersOrderUpdateSocket-", userSession.userId, letData.d)
	// 							} else {
	// 								connectionToOrderUpdateSocket.unsubscribe()
	// 								activeUsersSocketConnection.splice(activeUsersSocketConnection.indexOf(userSession.userId), 1)
	// 								logger.error("Error in order update socket " + letData)
	// 							}
	// 						},
	// 						user.email,
	// 					)
	// 				}
	// 			} else {
	// 				logger.info("User disconnected from fyers " + user.email)
	// 				activeUsersSocketConnection.splice(activeUsersSocketConnection.indexOf(user._id.toString()), 1)
	// 				user.connectedApps = user.connectedApps.filter((app: any) => app !== "fyers")
	// 				user.save()
	// 			}
	// 		})
	// 	}
	// }
	// for (const user of users) {
	// 	connectSocket(user)
	// }
	// setInterval(async () => {
	// 	const users = await User.find()
	// 	for (const user of users) {
	// 		const userIDString = user._id.toString()
	// 		if (!activeUsersSocketConnection.includes(userIDString)) {
	// 			connectSocket(user)
	// 		}
	// 	}
	// }, 5000)
}
