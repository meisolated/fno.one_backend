import { exitPosition, positionStatuses, updatePosition } from "../position.manager"

export default async function (position: iPosition, marketTick: iSymbolTicks) {
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
