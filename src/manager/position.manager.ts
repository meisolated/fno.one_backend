import chatter from "../events"
import { timeout } from "../helper"
import logger from "../logger"
import { Orders, Positions, User } from "../model"
import { placeOrder } from "./order.manager"
import moneyManager from "./positionApprovalAuthority/money.manager"
import riskManager from "./positionApprovalAuthority/risk.manager"
import handleNewPosition from "./positionHandler/handleNewPosition"
import handleOrderUpdates from "./positionHandler/handleOrderUpdates"
import handlePositionUpdates from "./positionHandler/handlePositionUpdates"
import handleStopLoss from "./positionHandler/handleStopLoss"
import handleStopLossTrailing from "./positionHandler/handleStopLossTrailing"
import handleTarget from "./positionHandler/handleTarget"

// export
export { handleNewPosition }

const positionInterval = 1000
const fyersOrderEventsDelay = 500

export const _positionsList = [] as iPosition[]
export const _ordersList = [] as iOrder[]
export const _tradesList = [] as iTrade[]

const marketData: any = {}

// chatter events

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
	// find all order from db with id from _positions
	const _orders = await Orders.find({ positionId: { $in: _positions.map((position) => position.id) } })
	_orders.forEach((order) => {
		_ordersList.push(order.toObject())
	})

	// ----------------------------------------------------------------
	// -----------------| Socket Events |------------------------------
	// ----------------------------------------------------------------
	chatter.on("fyersOrderUpdateSocket-", "order", async (orderData: iFyersSocketOrderUpdateData) => {
		await timeout(fyersOrderEventsDelay)
		await handleOrderUpdates(orderData)
	})
	chatter.on("fyersOrderUpdateSocket-", "position", async (positionData: iFyersSocketPositionUpdateData) => {})
	chatter.on("fyersOrderUpdateSocket-", "trade", async (tradeData: iFyersSocketTradeUpdateData) => {})
	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		marketData[symbolData.fySymbol] = symbolData
	})

	// ----------------------------------------------------------------
	// -----------------| Position Update Interval |--------------------
	// ----------------------------------------------------------------
	setInterval(async () => {
		await new Promise((resolve) =>
			_positionsList.forEach(async (_position_) => {
				if (inPositionStatues.includes(_position_.status)) {
					if (marketData[_position_.symbol] == undefined) return resolve(true)
					await handleStopLoss(_position_, marketData[_position_.symbol])
					await handleStopLossTrailing(_position_, marketData[_position_.symbol])
					await handleTarget(_position_, marketData[_position_.symbol])
					await handlePositionUpdates(_position_, marketData[_position_.symbol])
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

	setInterval(async () => {
		_positionsList.forEach(async (_position_) => {
			if (_position_.status == positionStatuses.orderFilled) {
				await updatePosition({ ..._position_, status: positionStatuses.inPosition, message: "InPosition" })
			}
		})
	}, 1000)
	// ----------------------------------------------------------------
}

/**
 *
 * @param userId userId String
 * @param position Position Object
 * @param result "positive" | "negative"
 */
export const exitPosition = async (userId: string, position: iPosition, result: "positive" | "negative") => {
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
export async function updateOrder(orderData: any) {
	_ordersList.forEach((order, index) => {
		if (order.orderId === orderData.orderId) {
			_ordersList[index] = orderData
		}
	})
	await Orders.findOneAndUpdate({ orderId: orderData.orderId }, orderData)
}
export async function createOrder(orderData: any) {
	_ordersList.push(orderData)
	const _order = await Orders.create(orderData)
	return _order.toObject()
}

export const positionStatuses = {
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
	positionManuallyClosed: "positionManuallyClosed",
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
	positionStatuses.positionManuallyClosed,
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
