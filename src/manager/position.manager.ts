import chatter from "../events"
import { timeout } from "../helper"
import logger from "../logger"
import { Orders, Positions, User } from "../model"
import { placeOrder } from "./order.manager"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"

export const _positionsList = [] as iPosition[]
export const _ordersList = [] as iOrder[]
export const _tradesList = [] as iTrade[]

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
	_positionsList.push(position)


	await moneyManager(position.id, user, position).then(async (moneyManagerApprovalResponse) => {
		if (moneyManagerApprovalResponse.status) {
			await updatePosition(moneyManagerApprovalResponse.position)
			await riskManager(position.id, user, moneyManagerApprovalResponse.position).then(async (riskManagerApprovalResponse) => {
				if (riskManagerApprovalResponse.status) {
					await updatePosition(riskManagerApprovalResponse.position)
					chatter.emit("positionManager-", "handOverToPositionManager", riskManagerApprovalResponse.position)
					return chatter.emit("positionManager-", "positionApproved", {
						status: "approved",
						message: "Position approved by money manager and risk manager",
						positionDetails: riskManagerApprovalResponse.position,
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
	const _positions = await Positions.find({ status: { $nin: closedPositionStatuses } })
	_positions.forEach((position) => {
		_positionsList.push(position.toObject())
	})
	chatter.on("positionManager-", "handOverToPositionManager", async (newPositionDetails: iPosition) => {
		const takePositionResponse = await enterPosition(newPositionDetails.userId, newPositionDetails)
		chatter.emit("positionManager-", "log", { status: "info", message: "Order placed", positionDetails: newPositionDetails, userId: newPositionDetails.userId, takePositionResponse })
	})

	// handle order update from fyers
	chatter.on("fyersOrderUpdateSocket-", "order", async (orderData: iFyersSocketOrderUpdateData) => {
		await timeout(500)
		const _order = _ordersList.find((order) => order.orderId === orderData.orderId)
		if (!_order) return logger.error("Order not found", "position.manager")
		var _position = _positionsList.find((position) => position.id === _order.positionId && beforePositionOrderFilledStatuses.includes(position.status))
		if (!_position) return logger.error("Position not found", "position.manager")


		if (orderData.status == 2) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderFilled, message: orderData.message })
		else if (orderData.status == 5) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderRejected, message: orderData.message })
		else if (orderData.status == 1) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderCancelled, message: orderData.message })
		else if (orderData.status == 6) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderPending, message: orderData.message })
		else if (orderData.status == 4) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderBeingPlaced, message: orderData.message })
		else if (orderData.filledQuantity >= 0 && orderData.remainingQuantity > 0) {
			await updatePosition({ ..._position, status: positionStatuses.orderPartiallyFilled, message: orderData.message })

		}


		//update order details in db

		const orderModified: any = {
			positionId: _position.id,
			status: orderData.status,
			message: orderData.message,
			exchOrdId: orderData.exchangeOrderId,
			orderId: orderData.orderId,
			symbol: orderData.symbol,
			quantity: orderData.quantity,
			remainingQuantity: orderData.remainingQuantity,
			filledQuantity: orderData.filledQuantity,
			segment: orderData.segment,
			limitPrice: orderData.limitPrice,
			stopPrice: orderData.stopPrice,
			productType: orderData.productType,
			orderType: orderData.orderType,
			side: orderData.orderSide,
			orderValidity: orderData.orderValidity,
			orderDateTime: orderData.orderDateTime,
			tradedPrice: orderData.tradedPrice,
			source: orderData.source,
			fyToken: orderData.fyToken,
			offlineOrder: orderData.offlineOrder,
			pan: orderData.pan,
			clientId: orderData.clientId,
			instrument: orderData.instrument,
		}
		updateOrder(orderModified)


		// handle position update

	})

	chatter.on("fyersOrderUpdateSocket-", "position", async (positionData: iFyersSocketPositionUpdateData) => {
		// console.log("positionData", positionData)
	})
	chatter.on("fyersOrderUpdateSocket-", "trade", async (tradeData: iFyersSocketTradeUpdateData) => {
		// console.log("tradeData", tradeData)
	})
	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		if (!symbolData) return
		const _position = _positionsList.filter((position) => position.symbol === symbolData.fySymbol)
		if (!_position) return
		_position.forEach((_position_) => {
			if (inPositionStatues.includes(_position_.status)) {
				trailingStopLoss(_position_, symbolData)
				stopLoss(_position_, symbolData)
				target(_position_, symbolData)
				updatePositionProfitAndLoss(_position_, symbolData)
			}
		})

	})
}

// --------------| Position Handler Function |---------------
/**
 * @info This function can only modify the position object, can't place order
 * @param position
 * @param marketTick
 */
async function trailingStopLoss(position: iPosition, marketTick: iSymbolTicks) {
	const currentSymbolPrice = marketTick.lp
	if (!position.trailingStopLoss || position.trailingStopLoss === 0) {
		const oneRatioOnePrice = position.price + position.stopLoss
		if (currentSymbolPrice > oneRatioOnePrice) {
			position.trailingStopLoss = position.price
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss activated" })
		}
	} else {
		const oneRatioOnePrice = position.trailingStopLoss + (position.stopLoss * 2)
		if (currentSymbolPrice > oneRatioOnePrice) {
			position.trailingStopLoss = position.trailingStopLoss + position.stopLoss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss shifted" })
		}
	}
}
/**
 * @info This function can close a position
 * @param position
 * @param marketTick
 */
async function stopLoss(position: iPosition, marketTick: iSymbolTicks) {
	const currentPrice = marketTick.lp
	if (position.trailingStopLoss == 0 || !position.trailingStopLoss) {
		const stopLossPrice = position.price - position.stopLoss
		if (currentPrice <= stopLossPrice) {
			// close position
			console.log("stopLoss hit")
			console.time("exitPosition")
			await exitPosition(position.userId, position, "negative")
			console.timeEnd("exitPosition")
			console.time("updatePosition")
			await updatePosition({ ...position, status: positionStatuses.positionClosedWithStopLoss, message: "Position closed with stop loss" })
			console.timeEnd("updatePosition")


		}
	} else {
		if (currentPrice <= position.trailingStopLoss) {
			console.log("stopLoss hit")
			console.time("exitPosition")
			await exitPosition(position.userId, position, "negative")
			console.timeEnd("exitPosition")
			console.time("updatePosition-trailingStopLoss")
			await updatePosition({ ...position, status: positionStatuses.positionClosedWithTrailingStopLoss, message: "Position closed with trailing stop loss" })
			console.timeEnd("updatePosition-trailingStopLoss")

		}
	}

}
/**
 * @info This function can close a position
 * @param position
 * @param marketTick
 */
async function target(position: iPosition, marketTick: iSymbolTicks) {
	const target = position.stopLoss * position.riskToRewardRatio
	const targetPrice = position.price + target
	const currentPrice = marketTick.lp
	console.log("currentPrice", currentPrice, "stopLoss", (position.price - position.stopLoss), "targetPrice", targetPrice, "positionId", position.id)
	if (currentPrice >= targetPrice) {
		// close position
		console.log("target hit")
		console.time("exitPosition")
		await exitPosition(position.userId, position, "positive")
		console.timeEnd("exitPosition")
		console.time("updatePosition-target")
		await updatePosition({ ...position, status: positionStatuses.positionClosedWithTarget, message: "Position closed with target" })
		console.timeEnd("updatePosition-target")

	}
}

/**
 * @info This function can only modify the position object, can't place order
 * @param position 
 * @param marketTick 
 */
function updatePositionProfitAndLoss(position: iPosition, marketTick: iSymbolTicks) { }
// ----------------------------------------------------------

const exitPosition = async (userId: string, position: iPosition, result: "positive" | "negative") => {
	const side = position.side == 1 ? -1 : 1
	const limitPrice = position.side == 1 ? result == "positive" ? position.price + (position.stopLoss * position.riskToRewardRatio) : position.price - position.stopLoss : result == "positive" ? position.price - (position.stopLoss * position.riskToRewardRatio) : position.price + position.stopLoss
	const prepareOrderFrame: iSingleOrder = {
		symbol: position.symbol,
		qty: position.quantity,
		side: side,
		type: 2,
		productType: "INTRADAY",
		limitPrice: 0, // limitPrice,
		stopPrice: 0,
		disclosedQty: 0,
		validity: "DAY",
		offlineOrder: false,
		stopLoss: 0,
		takeProfit: 0,
	}
	console.log("prepareOrderFrame", prepareOrderFrame)
	const orderResponse = await placeOrder(userId, prepareOrderFrame)
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
	}


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
		const lots = splitLots(900, position.quantity)
		await updatePosition({ ...position, status: positionStatuses.positionCancelled, message: "Position quantity is more than 900, splitting into multiple orders is currently disabled" })
	} else {
		const orderResponse = await placeOrder(userId, prepareOrderFrame)
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
		}

	}
}

export async function updatePosition(positionData: iPosition) {
	_positionsList.forEach((position, index) => {
		if (position.id === positionData.id) {
			_positionsList[index] = positionData
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

async function updateOrder(orderData: any) {
	_ordersList.forEach((order, index) => {
		if (order.orderId === orderData.orderId) {
			_ordersList[index] = orderData
		}
	})
	await Orders.findOneAndUpdate({ orderId: orderData.orderId }, orderData)
}
async function createOrder(orderData: any) {
	_ordersList.push(orderData)
	const _order = await Orders.create(orderData)
	return _order.toObject()
}

async function createPosition(positionData: iPosition) {
	_positionsList.push(positionData)
	const _position = await Positions.create(positionData)
	chatter.emit("positionManager-", "positionCreated", {
		status: positionData.status,
		message: positionData.message,
		positionDetails: positionData,
		positionId: positionData.id,
		userId: positionData.userId,
	})
	return _position
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
	rejectedByMoneyManager: "rejectedByMoneyManager",
	rejectedByRiskManager: "rejectedByRiskManager",
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

const beforePositionOrderFilledStatuses = [
	positionStatuses.approvedByMoneyManager,
	positionStatuses.approvedByRiskManager,
	positionStatuses.orderBeingPlaced,
	positionStatuses.orderPlaced,
	positionStatuses.orderPartiallyFilled,
	positionStatuses.orderPending,
	positionStatuses.inPosition,
	positionStatuses.positionNearStopLoss,
	positionStatuses.positionNearTarget,
	positionStatuses.trailingPositionStopLoss,
]

const inPositionStatues = [
	positionStatuses.orderFilled,
	positionStatuses.inPosition,
	positionStatuses.positionNearStopLoss,
	positionStatuses.positionNearTarget,
	positionStatuses.trailingPositionStopLoss,
]

const closedPositionStatuses = [
	positionStatuses.rejectedByRiskManager,
	positionStatuses.rejectedByMoneyManager,
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
