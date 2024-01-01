import logger from "../../logger"
import { _ordersList, _positionsList, positionStatuses, updatePosition } from "../position.manager"
import handleManuallyEnteredPositions from "./handleManuallyEnteredPositions"

export default async function (orderData: iFyersSocketOrderUpdateData) {
	const findOrderInList = _ordersList.find((order) => order.orderId === orderData.orderId)
	if (!findOrderInList) return await handleManuallyEnteredPositions(orderData)
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
				await updatePosition({
					..._position,
					orderStatus: orderData.status,
					status: positionStatuses.exitPositionOrderFilled,
					sellAveragePrice: orderData.limitPrice,
					message: orderData.message,
				})
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
					await updatePosition({
						..._position,
						orderStatus: orderData.status,
						status: positionStatuses.exitPositionOrderPartiallyFilled,
						filledQuantity: orderData.filledQuantity,
						remainingQuantity: orderData.remainingQuantity,
						message: orderData.message,
					})
				} else {
					await updatePosition({
						..._position,
						orderStatus: orderData.status,
						status: positionStatuses.orderPartiallyFilled,
						filledQuantity: orderData.filledQuantity,
						remainingQuantity: orderData.remainingQuantity,
						message: orderData.message,
					})
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
					await updatePosition({
						..._position,
						orderStatus: orderData.status,
						status: positionStatuses.exitPositionOrderFilled,
						sellAveragePrice: orderData.limitPrice,
						message: orderData.message,
					})
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
			await updatePosition({
				..._position,
				orderStatus: orderData.status,
				status: positionStatuses.exitPositionOrderPending,
				sellAveragePrice: orderData.limitPrice,
				message: orderData.message,
			})
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
			await updatePosition({
				..._position,
				orderStatus: orderData.status,
				status: positionStatuses.exitPositionOrderFilled,
				sellAveragePrice: orderData.limitPrice,
				message: orderData.message,
			})
		} else {
			await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderFilled, buyAveragePrice: orderData.limitPrice, message: orderData.message })
		}
	}
}
