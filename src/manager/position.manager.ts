import chatter from "../events"
import { timeout } from "../helper"
import logger from "../logger"
import { Orders, Positions, User } from "../model"
import { placeOrder } from "./order.manager"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"

const positionInterval = 1000
const fyersOrderEventsDelay = 500

export const _positionsList = [] as iPosition[]
export const _ordersList = [] as iOrder[]
export const _tradesList = [] as iTrade[]

const marketData: any = {}

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
				} else {
					return updatePosition(riskManagerApprovalResponse.position)
				}
			})
		} else {
			return updatePosition(moneyManagerApprovalResponse.position)
		}
	})
}

//  Entry function for position manager
export default async () => {
	logger.info("Loaded Position Manager", "Position Manager")

	// ----------------------------------------------------------------
	// -----------------| Load all positions from db |-----------------
	// ----------------------------------------------------------------
	const _positions = await Positions.find({ status: { $nin: closedPositionStatuses } })
	_positions.forEach((position) => {
		_positionsList.push(position.toObject())
	})
	// ----------------------------------------------------------------
	// -----------------| Internal Events |----------------------------
	// ----------------------------------------------------------------
	chatter.on("positionManager-", "handOverToPositionManager", async (newPositionDetails: iPosition) => {
		const takePositionResponse = await enterPosition(newPositionDetails.userId, newPositionDetails)
		chatter.emit("positionManager-", "log", { status: "info", message: "Order placed", positionDetails: newPositionDetails, userId: newPositionDetails.userId, takePositionResponse })
	})
	// ----------------------------------------------------------------
	// -----------------| Fyers Events |------------------------------
	// ----------------------------------------------------------------
	async function updatePositionBasesOnOrderUpdate(orderData: iFyersSocketOrderUpdateData) {
		console.log(orderData.limitPrice)
		/**
		 * if the order is filled then we don't have to do anything
		 * */
		const findOrderInList = _ordersList.find((order) => order.orderId === orderData.orderId)
		if (!findOrderInList) return handleManuallyPlacedOrder(orderData)
		const _position = _positionsList.find((position) => position.id === findOrderInList.positionId)
		if (!_position) return logger.error("Position not found", "position.manager")
		if (orderData.status == 1 || orderData.status == 5) {
			// order rejected or cancelled
			if (findOrderInList.status == 2) return logger.error("Order is already filled", "position.manager")
			if (findOrderInList.status == 1 || findOrderInList.status == 5) return logger.error("Order is already rejected or cancelled", "position.manager")
			if (
				_position.status == positionStatuses.exitPositionOrderPlaced ||
				_position.status == positionStatuses.exitPositionOrderPartiallyFilled ||
				_position.status == positionStatuses.exitPositionOrderPending
			) {
				await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.exitPositionOrderRejected, message: orderData.message })
			} else await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderRejected, message: orderData.message })
		} else if (orderData.status == 4) {
			if (findOrderInList.status == 1 || findOrderInList.status == 5) {
				logger.error("Order is already rejected or cancelled", "position.manager")
			} else if (findOrderInList.status == 2) {
				// order filled
				if (
					_position.status == positionStatuses.exitPositionOrderPlaced ||
					_position.status == positionStatuses.exitPositionOrderPartiallyFilled ||
					_position.status == positionStatuses.exitPositionOrderPending
				) {
					await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.exitPositionOrderFilled, sellAveragePrice: orderData.limitPrice, message: orderData.message })
				} else {
					await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderFilled, buyAveragePrice: orderData.limitPrice, message: orderData.message })
				}
			} else {
				// order partially filled
				if (orderData.filledQuantity >= 0 && orderData.remainingQuantity > 0) {
					if (
						_position.status == positionStatuses.exitPositionOrderPlaced ||
						_position.status == positionStatuses.exitPositionOrderPartiallyFilled ||
						_position.status == positionStatuses.exitPositionOrderPending
					) {
						await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.exitPositionOrderPartiallyFilled, filledQuantity: orderData.filledQuantity, remainingQuantity: orderData.remainingQuantity, message: orderData.message })
					} else {
						await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderPartiallyFilled, filledQuantity: orderData.filledQuantity, remainingQuantity: orderData.remainingQuantity, message: orderData.message })
					}
				} else if (orderData.filledQuantity == 0 && orderData.remainingQuantity > 0) {
					if (
						_position.status == positionStatuses.exitPositionOrderPlaced ||
						_position.status == positionStatuses.exitPositionOrderPartiallyFilled ||
						_position.status == positionStatuses.exitPositionOrderPending
					) {
						await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.exitPositionOrderPending, message: orderData.message })
					} else {
						await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderPending, message: orderData.message })
					}
				} else if (orderData.filledQuantity > 0 && orderData.remainingQuantity == 0) {
					console.log("rare case")
					if (
						_position.status == positionStatuses.exitPositionOrderPlaced ||
						_position.status == positionStatuses.exitPositionOrderPartiallyFilled ||
						_position.status == positionStatuses.exitPositionOrderPending
					) {
						await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.exitPositionOrderFilled, sellAveragePrice: orderData.limitPrice, message: orderData.message })
					} else {
						await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderFilled, buyAveragePrice: orderData.limitPrice, message: orderData.message })
					}
				}
			}
		} else if (orderData.status == 6) {
			// order pending
			if (findOrderInList.status == 2) return logger.error("Order is already filled", "position.manager")
			if (findOrderInList.status == 1 || findOrderInList.status == 5) return logger.error("Order is already rejected or cancelled", "position.manager")
			if (
				_position.status == positionStatuses.exitPositionOrderPlaced ||
				_position.status == positionStatuses.exitPositionOrderPartiallyFilled ||
				_position.status == positionStatuses.exitPositionOrderPending
			) {
				await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.exitPositionOrderPending, sellAveragePrice: orderData.limitPrice, message: orderData.message })
			} else {
				await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderPending, buyAveragePrice: orderData.limitPrice, message: orderData.message })
			}
		} else if (orderData.status == 2) {
			// order filled
			if (findOrderInList.status == 1 || findOrderInList.status == 5) return logger.error("Order is already rejected or cancelled", "position.manager")
			if (
				_position.status == positionStatuses.exitPositionOrderPlaced ||
				_position.status == positionStatuses.exitPositionOrderPartiallyFilled ||
				_position.status == positionStatuses.exitPositionOrderPending
			) {
				await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.exitPositionOrderFilled, sellAveragePrice: orderData.limitPrice, message: orderData.message })
			} else {
				await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderFilled, buyAveragePrice: orderData.limitPrice, message: orderData.message })
			}
		}

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
		await updateOrder(orderModified)
	}

	function handleManuallyPlacedOrder(orderData: iFyersSocketOrderUpdateData) {
		logger.warn("Manually placed order", "position.manager")
	}
	chatter.on("fyersOrderUpdateSocket-", "order", async (orderData: iFyersSocketOrderUpdateData) => {
		await timeout(fyersOrderEventsDelay)
		await updatePositionBasesOnOrderUpdate(orderData)
		// const _order = _ordersList.find((order) => order.orderId === orderData.orderId)
		// if (!_order) return logger.error("Order not found", "position.manager")
		// var _position = _positionsList.find((position) => position.id === _order.positionId && beforePositionOrderFilledStatuses.includes(position.status))
		// if (!_position) return logger.error("Position not found", "position.manager")

		// if (orderData.status == 2) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderFilled, message: orderData.message })
		// else if (orderData.status == 5) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderRejected, message: orderData.message })
		// else if (orderData.status == 1) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderCancelled, message: orderData.message })
		// else if (orderData.status == 6) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderPending, message: orderData.message })
		// else if (orderData.status == 4) await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderBeingPlaced, message: orderData.message })
		// if (orderData.filledQuantity >= 0 && orderData.remainingQuantity > 0) {
		// 	await updatePosition({ ..._position, status: positionStatuses.orderPartiallyFilled, message: orderData.message })
		// }

		// //update order details in db

		// const orderModified: any = {
		// 	positionId: _position.id,
		// 	status: orderData.status,
		// 	message: orderData.message,
		// 	exchOrdId: orderData.exchangeOrderId,
		// 	orderId: orderData.orderId,
		// 	symbol: orderData.symbol,
		// 	quantity: orderData.quantity,
		// 	remainingQuantity: orderData.remainingQuantity,
		// 	filledQuantity: orderData.filledQuantity,
		// 	segment: orderData.segment,
		// 	limitPrice: orderData.limitPrice,
		// 	stopPrice: orderData.stopPrice,
		// 	productType: orderData.productType,
		// 	orderType: orderData.orderType,
		// 	side: orderData.orderSide,
		// 	orderValidity: orderData.orderValidity,
		// 	orderDateTime: orderData.orderDateTime,
		// 	tradedPrice: orderData.tradedPrice,
		// 	source: orderData.source,
		// 	fyToken: orderData.fyToken,
		// 	offlineOrder: orderData.offlineOrder,
		// 	pan: orderData.pan,
		// 	clientId: orderData.clientId,
		// 	instrument: orderData.instrument,
		// }
		// updateOrder(orderModified)

		// handle position update
	})

	chatter.on("fyersOrderUpdateSocket-", "position", async (positionData: iFyersSocketPositionUpdateData) => {
		// console.log("positionData", positionData)
	})
	chatter.on("fyersOrderUpdateSocket-", "trade", async (tradeData: iFyersSocketTradeUpdateData) => {
		// console.log("tradeData", tradeData)
	})
	// ----------------------------------------------------------------
	// -----------------| TrueData Events |----------------------------
	// ----------------------------------------------------------------
	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		marketData[symbolData.fySymbol] = symbolData
	})
	// ----------------------------------------------------------------
	// -----------------| Position Manager Events |--------------------
	// ----------------------------------------------------------------
	setInterval(async () => {
		await new Promise((resolve) =>
			_positionsList.forEach(async (_position_) => {
				if (inPositionStatues.includes(_position_.status)) {
					if (marketData[_position_.symbol] == undefined) return resolve(true)
					await stopLoss(_position_, marketData[_position_.symbol])
					await trailingStopLoss(_position_, marketData[_position_.symbol])
					await target(_position_, marketData[_position_.symbol])
					await updatePositionProfitAndLoss(_position_, marketData[_position_.symbol])
					// peakLTP
					if (marketData[_position_.symbol].lp > _position_.peakLTP) {
						updatePosition({ ..._position_, peakLTP: marketData[_position_.symbol].lp })
					}
					return resolve(true)
				} else {
					return resolve(true)
				}
			}),
		)
	}, positionInterval)

	// ----------------------------------------------------------------

	setInterval(async () => {
		_positionsList.forEach(async (_position_) => {
			if (_position_.status == positionStatuses.orderFilled) {
				await updatePosition({ ..._position_, status: positionStatuses.inPosition, message: "InPosition" })
			}
		})
	}, 1000)
}

// ----------------------------------------------------------------
// --------------| Position Handler Function |---------------------
// ----------------------------------------------------------------
/**
 * @info This function can only modify the position object, can't place order
 * @param position
 * @param marketTick
 */
async function trailingStopLoss(position: iPosition, marketTick: iSymbolTicks) {
	const currentSymbolPrice = marketTick.lp
	if (!position.trailingStopLoss || position.trailingStopLoss === 0) {
		const oneRatioTwoPrice = position.price + (position.stopLoss * 2) // when lp is above 1:2
		if (currentSymbolPrice > oneRatioTwoPrice) {
			position.trailingStopLoss = position.price + position.stopLoss // 1:1 will be our trailing stop loss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss activated" })
		}
	} else {
		const nextRatioPrice = position.trailingStopLoss + (position.stopLoss * 2) // after that every ratio will be our trailing stop loss
		if (currentSymbolPrice > nextRatioPrice) {
			position.trailingStopLoss = position.trailingStopLoss + position.stopLoss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss shifted" })
		}
	}

	// const typesOfTrailing = ["simple", "decremental", "fibonacci"]
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
			await updatePosition({ ...position, status: positionStatuses.positionClosedWithStopLoss, message: "Position closed with stop loss" })
			await exitPosition(position.userId, position, "negative")
		}
	} else {
		if (currentPrice <= position.trailingStopLoss) {
			console.log("stopLoss hit")
			await updatePosition({ ...position, status: positionStatuses.positionClosedWithTrailingStopLoss, message: "Position closed with trailing stop loss" })
			await exitPosition(position.userId, position, "negative")
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
	console.log("currentPrice", currentPrice, "stopLoss", position.price - position.stopLoss, "targetPrice", targetPrice, "positionId", position.id, "positionStatus", position.status)
	if (currentPrice >= targetPrice) {
		// close position
		console.log("target hit")
		await updatePosition({ ...position, status: positionStatuses.positionClosedWithTarget, message: "Position closed with target" })
		await exitPosition(position.userId, position, "positive")
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
	const limitPrice =
		position.side == 1
			? result == "positive"
				? position.price + position.stopLoss * position.riskToRewardRatio
				: position.price - position.stopLoss
			: result == "positive"
				? position.price - position.stopLoss * position.riskToRewardRatio
				: position.price + position.stopLoss
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
	console.time("exitPosition")
	const orderResponse = await placeOrder(userId, prepareOrderFrame)
	console.timeEnd("exitPosition")
	if (orderResponse.message.includes("Successfully placed order")) {
		await updatePosition({ ...position, status: positionStatuses.exitPositionOrderPlaced, message: orderResponse.message })
		// create order in db and update position
	} else {
		await updatePosition({ ...position, status: positionStatuses.exitPositionOrderFailed, message: orderResponse.message })
	}
	if (orderResponse.id) {
		await createOrder({
			positionId: position.id,
			orderId: orderResponse.id,
		})
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
			const orderData = _ordersList.find((order) => order.orderId === orderResponse.id)
			await updateOrder({ ...orderData, status: 5, message: orderResponse.message })
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
	console.log(positionData.status)
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
	exitPositionOrderPlaced: "exitPositionOrderPlaced",
	exitPositionOrderFilled: "exitPositionOrderFilled",
	exitPositionOrderRejected: "exitPositionOrderRejected",
	exitPositionOrderCancelled: "exitPositionOrderCancelled",
	exitPositionOrderFailed: "exitPositionOrderFailed",
	exitPositionOrderExpired: "exitPositionOrderExpired",
	exitPositionOrderPartiallyFilled: "exitPositionOrderPartiallyFilled",
	exitPositionOrderPending: "exitPositionOrderPending",
	exitPositionOrderBeingPlaced: "exitPositionOrderBeingPlaced",
}

export const beforePositionOrderFilledStatuses = [
	positionStatuses.approvedByMoneyManager,
	positionStatuses.approvedByRiskManager,
	positionStatuses.orderBeingPlaced,
	positionStatuses.orderPlaced,
	positionStatuses.orderPartiallyFilled,
	positionStatuses.orderPending,
]

export const inPositionStatues = [
	positionStatuses.orderFilled,
	positionStatuses.inPosition,
	positionStatuses.positionNearStopLoss,
	positionStatuses.positionNearTarget,
	positionStatuses.trailingPositionStopLoss,
]

export const closedPositionStatuses = [
	positionStatuses.positionClosed,
	positionStatuses.handedOverToUser,
	positionStatuses.positionClosedWithTarget,
	positionStatuses.positionClosedWithStopLoss,
	positionStatuses.positionClosedWithTrailingStopLoss,
	positionStatuses.exitPositionOrderPlaced,
	positionStatuses.exitPositionOrderFilled,
	positionStatuses.exitPositionOrderPartiallyFilled,
	positionStatuses.exitPositionOrderPending,
	positionStatuses.exitPositionOrderBeingPlaced,
]

export const rejectedPositionStatuses = [
	positionStatuses.rejectedByRiskManager,
	positionStatuses.rejectedByMoneyManager,
	positionStatuses.orderRejected,
	positionStatuses.orderCancelled,
	positionStatuses.orderFailed,
	positionStatuses.orderExpired,
	positionStatuses.positionCancelled,
	positionStatuses.positionFailed,
	positionStatuses.positionExpired,
	positionStatuses.exitPositionOrderRejected,
	positionStatuses.exitPositionOrderCancelled,
	positionStatuses.exitPositionOrderFailed,
	positionStatuses.exitPositionOrderExpired,
]
