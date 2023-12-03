import chatter from "../events"
import logger from "../logger"
import { User } from "../model"
import { placeOrder } from "./order.manager"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"

export default async () => {
	logger.info("Loaded Position Manager", "Position Manager")
	chatter.on("positionManager-", "newPositionDetails", async (newPositionDetails: iNewPositionDetails) => {
		const user = await User.findById(newPositionDetails.userId)
		if (!user) return logger.error("User not found", "trade.manager")
		// create position

		chatter.emit("positionManager-", "positionDetailsReceived", { status: "received", message: "New position details received", positionDetails: newPositionDetails, userId: user._id })

		//Asking money manager for approval
		const moneyManagerApproval = await moneyManager(user, newPositionDetails)
		if (moneyManagerApproval) {
			//Asking risk manager for approval
			const riskManagerApproval = await riskManager(user, newPositionDetails)
			if (riskManagerApproval) {
				chatter.emit("positionManager-", "handOverToPositionManager", newPositionDetails)
				return chatter.emit("positionManager-", "positionApproved", {
					userId: user._id,
					status: "approved",
					message: "Position approved by money manager and risk manager",
					positionDetails: newPositionDetails,
				})
			}
		}
	})

	chatter.on("positionManager-", "handOverToPositionManager", async (newPositionDetails: iNewPositionDetails) => {
		const prepareSingleOrderDetails: iSingleOrder = {
			symbol: newPositionDetails.symbol,
			qty: newPositionDetails.quantity,
			side: newPositionDetails.orderSide,
			type: 1,
			productType: "INTRADAY",
			limitPrice: newPositionDetails.limitPrice,
			stopPrice: 0,
			disclosedQty: 0,
			validity: "DAY",
			offlineOrder: false,
			stopLoss: 0,
			takeProfit: 0,
		}
		const takePositionResponse = await placeOrder(newPositionDetails.userId, prepareSingleOrderDetails)
	})

	chatter.on("fyersOrderUpdateSocket-", "order", async (orderData: iFyersSocketOrderUpdateData) => {
		console.log(orderData)
	})
	chatter.on("fyersOrderUpdateSocket-", "position", async (positionData: iFyersSocketPositionUpdateData) => {
		console.log(positionData)
	})
	chatter.on("fyersOrderUpdateSocket-", "trade", async (tradeData: iFyersSocketTradeUpdateData) => {
		console.log(tradeData)
	})
}
