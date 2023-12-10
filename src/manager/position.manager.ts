import chatter from "../events"
import { timeout } from "../helper"
import logger from "../logger"
import { Orders, Positions, User } from "../model"
import { placeOrder } from "./order.manager"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"

export const positions = [] as iPosition[]
export const orders = [] as iOrder[]
export const trades = [] as iTrade[]

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
		.then((position) => {
			return position.toObject()
		})
		.catch((err) => {
			chatter.emit("positionManager-", "positionDetailsReceived", {
				status: "error",
				message: "Error while creating position",
				positionDetails: newPositionDetails,
				userId: newPositionDetails.userId,
			})
			return logger.error("Error while creating position " + err.message, "trade.manager")
		})
	if (!position) return logger.error("Error while creating position", "trade.manager")
	chatter.emit("positionManager-", "positionDetailsReceived", { status: "received", message: "New position details received", positionDetails: position, userId: user._id })
	positions.push(position)

	await moneyManager(position.id, user, position).then(async (moneyManagerApprovalResponse) => {
		if (moneyManagerApprovalResponse) {
			await riskManager(position.id, user, position).then((riskManagerApprovalResponse) => {
				if (riskManagerApprovalResponse) {
					chatter.emit("positionManager-", "handOverToPositionManager", position)
					return chatter.emit("positionManager-", "positionApproved", {
						status: "approved",
						message: "Position approved by money manager and risk manager",
						positionDetails: position,
						positionId: position.id,
						userId: user._id,
					})
				}
			})
		}
	})
}

export default async () => {
	logger.info("Loaded Position Manager", "Position Manager")
	const _positions = await Positions.find({ status: { $nin: ["positionClosed", "positionCancelled", "positionFailed", "positionExpired"] } })
	_positions.forEach((position) => {
		positions.push(position.toObject())
	})
	chatter.on("positionManager-", "handOverToPositionManager", async (newPositionDetails: iPosition) => {
		const takePositionResponse = await executeOrder(newPositionDetails.userId, newPositionDetails)
		chatter.emit("positionManager-", "log", { status: "info", message: "Order placed", positionDetails: newPositionDetails, userId: newPositionDetails.userId, takePositionResponse })
	})

	// handle order update from fyers
	chatter.on("fyersOrderUpdateSocket-", "order", async (orderData: iFyersSocketOrderUpdateData) => {
		await timeout(1000)
		const _order = await Orders.findOne({ orderId: orderData.orderId })
		if (!_order) return logger.error("Order not found", "position.manager")
		const _position = await Positions.findOne({ id: _order.positionId })
		if (!_position) return logger.error("Position not found", "position.manager")

		if (orderData.status == 2) {
			// order filled
			await updatePosition({ ..._position.toObject(), status: positionStatuses.orderFilled, message: orderData.message })
		} else if (orderData.status == 5) {
			// order rejected
			await updatePosition({ ..._position.toObject(), status: positionStatuses.orderRejected, message: orderData.message })
		} else if (orderData.status == 1) {
			// order cancelled
			await updatePosition({ ..._position.toObject(), status: positionStatuses.orderCancelled, message: orderData.message })
		} else if (orderData.status == 6) {
			// order pending
			await updatePosition({ ..._position.toObject(), status: positionStatuses.orderPending, message: orderData.message })
		} else if (orderData.status == 4) {
			// in transit
			await updatePosition({ ..._position.toObject(), status: positionStatuses.orderBeingPlaced, message: orderData.message })
		}

		if (orderData.filledQuantity > 0 && orderData.remainingQuantity > 0) {
			await updatePosition({ ..._position.toObject(), status: positionStatuses.orderPartiallyFilled, message: orderData.message })
		}

		// } else if (orderData.status === 3) { // for future use
		// 	await updatePosition({ ..._position, status: positionStatuses.orderExpired, message: orderData.message })

		//update order details in db
		_order.status = orderData.status
		_order.message = orderData.message
		_order.exchOrdId = orderData.exchangeOrderId
		_order.orderId = orderData.orderId
		_order.symbol = orderData.symbol
		_order.quantity = orderData.quantity
		_order.remainingQuantity = orderData.remainingQuantity
		_order.filledQuantity = orderData.filledQuantity
		_order.segment = orderData.segment
		_order.limitPrice = orderData.limitPrice
		_order.stopPrice = orderData.stopPrice
		_order.productType = orderData.productType
		_order.orderType = orderData.orderType
		_order.side = orderData.orderSide
		_order.orderValidity = orderData.orderValidity
		_order.orderDateTime = orderData.orderDateTime
		_order.tradedPrice = orderData.tradedPrice
		_order.source = orderData.source
		_order.fyToken = orderData.fyToken
		_order.offlineOrder = orderData.offlineOrder
		_order.pan = orderData.pan
		_order.clientId = orderData.clientId
		_order.exchOrdId = orderData.exchangeOrderId
		_order.instrument = orderData.instrument
		await _order.save()

		// handle position update
	})

	chatter.on("fyersOrderUpdateSocket-", "position", async (positionData: iFyersSocketPositionUpdateData) => {
		console.log("positionData", positionData)
	})
	chatter.on("fyersOrderUpdateSocket-", "trade", async (tradeData: iFyersSocketTradeUpdateData) => {
		console.log("tradeData", tradeData)
	})
	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		if (!symbolData) return

	})
}

const executeOrder = async (userId: string, position: iPosition) => {
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
		const lots = splitLots(900, position.quantity)
		await updatePosition({ ...position, status: positionStatuses.positionCancelled, message: "Position quantity is more than 900, splitting into multiple orders is currently disabled" })
	} else {
		const orderResponse = await placeOrder(userId, prepareOrderFrame)
		if (orderResponse.message.includes("Successfully placed order")) {
			await updatePosition({ ...position, status: positionStatuses.orderPlaced, message: orderResponse.message })
			// create order in db and update position
		} else {
			await updatePosition({ ...position, status: positionStatuses.orderFailed, message: orderResponse.message })
		}
		if (orderResponse.id) {
			await Orders.create({
				positionId: position.id,
				orderId: orderResponse.id,
			})
		}
	}
}

export async function updatePosition(positionData: iPosition) {
	positions.forEach((position, index) => {
		if (position.id === positionData.id) {
			positions[index] = positionData
		}
	})
	chatter.emit("positionManager-", "positionUpdated", {
		status: positionData.status,
		message: positionData.message,
		positionDetails: positionData,
		positionId: positionData.id,
		userId: positionData.userId,
	})
	await Positions.findOneAndUpdate({ id: positionData.id }, positionData)
}
async function createPosition(positionData: iPosition) {
	const _position = await Positions.create(positionData)
	chatter.emit("positionManager-", "positionCreated", {
		status: positionData.status,
		message: positionData.message,
		positionDetails: positionData,
		positionId: positionData.id,
		userId: positionData.userId,
	})
	return _position.toObject()
}

function splitLots(lot: number, quantity: number): number[] {
	const lots: number[] = []
	while (quantity > 0) {
		// Determine the current lot size (minimum between lot and quantity)
		const currentLotSize = Math.min(lot, quantity)
		// Subtract the current lot size from the remaining quantity
		quantity -= currentLotSize
		// Push the current lot size to the array
		lots.push(currentLotSize)
	}
	return lots
}

const positionStatuses = {
	approvedByMoneyManager: "approvedByMoneyManager",
	approvedByRiskManager: "approvedByRiskManager",
	orderBeingPlaced: "orderBeingPlaced",
	orderPlaced: "orderPlaced",
	orderRejected: "orderRejected",
	orderCancelled: "orderCancelled",
	orderFilled: "orderFilled",
	orderPartiallyFilled: "orderPartiallyFilled",
	orderPending: "orderPending",
	orderFailed: "orderFailed",
	orderExpired: "orderExpired",
	inPosition: "inPosition",
	positionClosed: "positionClosed",
	positionCancelled: "positionCancelled",
	positionFailed: "positionFailed",
	positionExpired: "positionExpired",
	handedOverToUser: "handedOverToUser",
	positionNearStopLoss: "positionNearStopLoss",
	positionNearTarget: "positionNearTarget",
	trailingPositionStopLoss: "trailingPositionStopLoss",
	positionClosedWithTarget: "positionClosedWithTarget",
	positionClosedWithStopLoss: "positionClosedWithStopLoss",
	positionClosedWithTrailingStopLoss: "positionClosedWithTrailingStopLoss",
}

const activePositionStatuses = [
	positionStatuses.approvedByMoneyManager,
	positionStatuses.approvedByRiskManager,
	positionStatuses.orderBeingPlaced,
	positionStatuses.orderPlaced,
	positionStatuses.orderFilled,
	positionStatuses.orderPartiallyFilled,
	positionStatuses.orderPending,
	positionStatuses.inPosition,
	positionStatuses.positionNearStopLoss,
	positionStatuses.positionNearTarget,
	positionStatuses.trailingPositionStopLoss,
]
const closedPositionStatuses = [
	positionStatuses.orderRejected,
	positionStatuses.orderCancelled,
	positionStatuses.orderFailed,
	positionStatuses.orderExpired,
	positionStatuses.positionClosed,
	positionStatuses.positionCancelled,
	positionStatuses.positionFailed,
	positionStatuses.positionExpired,
	positionStatuses.handedOverToUser,
	positionStatuses.positionClosedWithTarget,
	positionStatuses.positionClosedWithStopLoss,
	positionStatuses.positionClosedWithTrailingStopLoss,
]
