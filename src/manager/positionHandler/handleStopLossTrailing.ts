import { positionStatuses, updatePosition } from "../position.manager"

export default async function (position: iPosition, marketTick: iSymbolTicks) {
	const currentSymbolPrice = marketTick.lp
	if (!position.trailingStopLoss || position.trailingStopLoss === 0) {
		const oneRatioTwoPrice = position.price + position.stopLoss * 2 // when lp is above 1:2
		if (currentSymbolPrice > oneRatioTwoPrice) {
			position.trailingStopLoss = position.price + position.stopLoss // 1:1 will be our trailing stop loss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss activated" })
		}
	} else {
		const nextRatioPrice = position.trailingStopLoss + position.stopLoss * 2 // after that every ratio will be our trailing stop loss
		if (currentSymbolPrice > nextRatioPrice) {
			position.trailingStopLoss = position.trailingStopLoss + position.stopLoss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss shifted" })
		}
	}
	// const typesOfTrailing = ["simple", "decremental", "fibonacci"]
}
