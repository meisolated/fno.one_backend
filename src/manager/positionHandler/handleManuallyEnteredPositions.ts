import logger from "../../logger"
import { _positionsList, createOrder, inPositionStatues, positionStatuses, updatePosition } from "../position.manager"

export default async function (orderData: iFyersSocketOrderUpdateData) {
	const _position = _positionsList.find(
		(position) => position.symbol === orderData.symbol && inPositionStatues.includes(position.status) && position.side !== orderData.orderSide && position.quantity === orderData.quantity,
	)
	if (!_position) return logger.error("new position entered manually", "position.manager")
	await createOrder({
		positionId: _position.id,
		orderId: orderData.orderId,
	})
	await updatePosition({ ..._position, status: positionStatuses.exitPositionOrderPlaced, message: "position closed manually" })
}

function handleManuallyEnteredPositions() { }
