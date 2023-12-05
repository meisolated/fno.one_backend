import chatter from "../events"
import logger from "../logger"
import { Positions, User } from "../model"
import { placeOrder } from "./order.manager"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"


// Handle new position request 
export const takeNewPosition = async (newPositionDetails: iNewPositionDetails) => {
	const user = await User.findById(newPositionDetails.userId)
	if (!user) {
		chatter.emit("positionManager-", "positionDetailsReceived", { status: "error", message: "User not found", positionDetails: newPositionDetails, userId: newPositionDetails.userId })
		return logger.error("User not found", "trade.manager")
	}
	// create position
	const position = await Positions.create({
		userId: user._id.toString(),
		paper: false,
		whichBroker: "fyers",
		side: newPositionDetails.orderSide,
		symbol: newPositionDetails.symbol,
		price: newPositionDetails.limitPrice,
		quantity: newPositionDetails.quantity,
		stopLoss: newPositionDetails.stopLoss,
		riskToRewardRatio: newPositionDetails.riskToReward,
		orderType: 1,
		productType: "INTRADAY",
		positionType: newPositionDetails.positionType,
		madeBy: "user",
		strategyName: "user",
		orderStatus: 6,
		status: "created",
		message: "created",
		enteredAt: 0,
		exitedAt: 0,
	})
	const positionId = position.id
	chatter.emit("positionManager-", "positionDetailsReceived", { status: "received", message: "New position details received", positionDetails: newPositionDetails, userId: user._id })

	await moneyManager(positionId, user, newPositionDetails).then(async (moneyManagerApprovalResponse) => {
		if (moneyManagerApprovalResponse) {
			await riskManager(positionId, user, newPositionDetails).then((riskManagerApprovalResponse) => {
				if (riskManagerApprovalResponse) {
					chatter.emit("positionManager-", "handOverToPositionManager", newPositionDetails)
					return chatter.emit("positionManager-", "positionApproved", {
						status: "approved",
						message: "Position approved by money manager and risk manager",
						positionDetails: newPositionDetails,
						positionId,
						userId: user._id,
					})
				}
			})
		}
	})
}

// Handle position update request
export default async () => {
	logger.info("Loaded Position Manager", "Position Manager")
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
		chatter.emit("positionManager-", "log", { status: "info", message: "Order placed", positionDetails: newPositionDetails, userId: newPositionDetails.userId, takePositionResponse })
	})

	chatter.on("fyersOrderUpdateSocket-", "order", async (orderData: iFyersSocketOrderUpdateData) => {
		console.log("orderData", orderData)
	})
	chatter.on("fyersOrderUpdateSocket-", "position", async (positionData: iFyersSocketPositionUpdateData) => {
		console.log("positionData", positionData)
	})
	chatter.on("fyersOrderUpdateSocket-", "trade", async (tradeData: iFyersSocketTradeUpdateData) => {
		console.log("tradeData", tradeData)
	})
}

// Handle positions on server restart