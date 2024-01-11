import chatter from "../../../events"
import logger from "../../../logger"
import { Positions, User } from "../../../model"
import { placeOrder } from "../order.manager"
import { _ordersList, _positionsList, createOrder, positionStatuses, updateOrder, updatePosition } from "../position.manager"
import moneyManager from "../positionApprovalAuthority/money.manager"
import riskManager from "../positionApprovalAuthority/risk.manager"

export default async function (newPosition: iNewPositionDetails) {
	const user = await User.findById(newPosition.userId)
	if (!user) {
		chatter.emit("positionManager-", "positionDetailsReceived", { status: "error", message: "User not found", positionDetails: newPosition, userId: newPosition.userId })
		return logger.error("User not found " + newPosition.userId, "PositionManager")
	}
	// create position
	const position = await Positions.create({
		userId: user._id.toString(),
		paper: false,
		whichBroker: "fyers",
		side: newPosition.orderSide,
		symbol: newPosition.symbol,
		price: newPosition.limitPrice,
		quantity: newPosition.quantity,
		stopLoss: newPosition.stopLoss,
		riskToRewardRatio: newPosition.riskToReward,
		orderType: 1,
		productType: "INTRADAY",
		positionType: newPosition.positionType,
		madeBy: "user",
		strategyName: "user",
		orderStatus: 6,
		status: "created",
		message: "created",
		enteredAt: 0,
		exitedAt: 0,
	})
		.then((position) => {
			return position.toObject()
		})
		.catch((err) => {
			chatter.emit("positionManager-", "positionDetailsReceived", {
				status: "error",
				message: "Error while creating position",
				positionDetails: newPosition,
				userId: newPosition.userId,
			})
			return logger.error("Error while creating position " + err.message, "trade.manager")
		})
	if (!position) return logger.error("Error while creating position", "trade.manager")
	chatter.emit("positionManager-", "positionDetailsReceived", { status: "received", message: "New position details received", positionDetails: position, userId: user._id })
	_positionsList.push(position)

	await moneyManager(position.id, user, position).then(async (moneyManagerApprovalResponse) => {
		if (moneyManagerApprovalResponse.status) {
			await updatePosition(moneyManagerApprovalResponse.position)
			await riskManager(position.id, user, moneyManagerApprovalResponse.position).then(async (riskManagerApprovalResponse) => {
				if (riskManagerApprovalResponse.status) {
					await updatePosition(riskManagerApprovalResponse.position)
					chatter.emit("positionManager-", "positionApproved", {
						status: "approved",
						message: "Position approved by money manager and risk manager",
						positionDetails: riskManagerApprovalResponse.position,
						positionId: position.id,
						userId: user._id,
					})
					const takePositionResponse = await enterPosition(user._id.toString(), riskManagerApprovalResponse.position)
					chatter.emit("positionManager-", "log", { status: "info", message: "Order placed", positionDetails: newPosition, userId: newPosition.userId, takePositionResponse })
					return
				} else {
					return updatePosition(riskManagerApprovalResponse.position)
				}
			})
		} else {
			return updatePosition(moneyManagerApprovalResponse.position)
		}
	})
}

const enterPosition = async (userId: string, position: iPosition) => {
	const prepareOrderFrame: iSingleOrder = {
		symbol: position.symbol,
		qty: position.quantity,
		side: position.side,
		type: 1,
		productType: "INTRADAY",
		limitPrice: position.price,
		stopPrice: 0,
		disclosedQty: 0,
		validity: "DAY",
		offlineOrder: false,
		stopLoss: 0,
		takeProfit: 0,
	}
	if (position.quantity > 900) {
		const lots = splitQuantity(900, position.quantity)
		await updatePosition({ ...position, status: positionStatuses.positionCancelled, message: "Position quantity is more than 900, splitting into multiple orders is currently disabled" })
	} else {
		console.time("placeOrder")
		const orderResponse = await placeOrder(userId, prepareOrderFrame)
		console.timeEnd("placeOrder")
		if (orderResponse.id) {
			await createOrder({
				positionId: position.id,
				orderId: orderResponse.id,
			})
		}
		if (orderResponse.message.includes("Successfully placed order")) {
			await updatePosition({ ...position, status: positionStatuses.orderPlaced, message: orderResponse.message })
			// create order in db and update position
		} else {
			await updatePosition({ ...position, status: positionStatuses.orderFailed, message: orderResponse.message })
			const orderData = _ordersList.find((order) => order.orderId === orderResponse.id)
			await updateOrder({ ...orderData, status: 5, message: orderResponse.message })
		}
	}
}
function splitQuantity(lot: number, quantity: number): number[] {
	const lots: number[] = []
	while (quantity > 0) {
		const currentLotSize = Math.min(lot, quantity)
		quantity -= currentLotSize
		lots.push(currentLotSize)
	}
	return lots
}
