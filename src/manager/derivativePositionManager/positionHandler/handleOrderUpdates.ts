import logger from "../../../logger"
import { _ordersList, _positionsList, positionStatuses, updatePosition } from "../position.manager"
import handleManuallyEnteredPositions from "./handleManuallyEnteredPositions"

export default async function (orderData: iFyersSocketOrderUpdateData) {
	const findOrderInList = _ordersList.find((order) => order.orderId === orderData.orderId)
	if (!findOrderInList) return await handleManuallyEnteredPositions(orderData)
	const _position = _positionsList.find((position) => position.id === findOrderInList.positionId)
	if (!_position) return logger.error("Position not found", "position.manager")
	if (orderData.status == 2) {
		if (_position.status == positionStatuses.exitPositionOrderPending || _position.status == positionStatuses.exitPositionOrderPartiallyFilled || _position.status == positionStatuses.exitPositionOrderPlaced || _position.status == positionStatuses.inPosition) {
			await updatePosition({
				..._position,
				orderStatus: orderData.status,
				filledQuantity: _position.quantity,
				remainingQuantity: 0,
				status: positionStatuses.exitPositionOrderFilled,
				sellAveragePrice: orderData.limitPrice,
				message: orderData.message,
			})
		} else {
			await updatePosition({
				..._position, orderStatus: orderData.status, filledQuantity: _position.quantity,
				remainingQuantity: 0, status: positionStatuses.orderFilled, buyAveragePrice: orderData.limitPrice, message: orderData.message
			})
		}
	}
	else if (orderData.status == 4 || orderData.status == 6) {
		if (_position.status == positionStatuses.exitPositionOrderPending || _position.status == positionStatuses.exitPositionOrderPartiallyFilled || _position.status == positionStatuses.exitPositionOrderPlaced || _position.status == positionStatuses.inPosition) {
			await updatePosition({
				..._position,
				orderStatus: orderData.status,
				status: positionStatuses.exitPositionOrderPartiallyFilled,
				filledQuantity: orderData.filledQuantity,
				sellAveragePrice: orderData.limitPrice,
				remainingQuantity: orderData.remainingQuantity,
				message: orderData.message,
			})
		} else {
			await updatePosition({
				..._position,
				orderStatus: orderData.status,
				status: positionStatuses.orderPartiallyFilled,
				filledQuantity: orderData.filledQuantity,
				buyAveragePrice: orderData.limitPrice,
				remainingQuantity: orderData.remainingQuantity,
				message: orderData.message,
			})
		}
	}
	else if (orderData.status == 1 || orderData.status == 5 || orderData.status == 3) {
		if (_position.status == positionStatuses.exitPositionOrderPending || _position.status == positionStatuses.exitPositionOrderPartiallyFilled || _position.status == positionStatuses.exitPositionOrderPlaced || _position.status == positionStatuses.inPosition) {
			await updatePosition({
				..._position,
				orderStatus: orderData.status,
				status: positionStatuses.exitPositionOrderRejected,
				message: orderData.message,
			})
		} else {
			await updatePosition({ ..._position, orderStatus: orderData.status, status: positionStatuses.orderRejected, message: orderData.message })
		}
	} else {
		logger.error("Order status not handled " + orderData.status, "position.manager")
	}

}
