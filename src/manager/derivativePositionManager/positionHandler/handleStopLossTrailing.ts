import { positionStatuses, updatePosition } from "../position.manager"

const trailingStartFromWhatRatio = 2 // 1:2
export default async function (position: iPosition, marketTick: iSymbolTicks) {
	const currentSymbolPrice = marketTick.lp
	if (!position.trailingStopLoss || position.trailingStopLoss === 0) {
		const oneRatioTwoPrice = position.side == 1 ? position.price + position.stopLoss * trailingStartFromWhatRatio : position.price - position.stopLoss * trailingStartFromWhatRatio
		if (position.side == 1 && currentSymbolPrice > oneRatioTwoPrice) {
			position.trailingStopLoss = position.price + position.stopLoss // 1:1 will be our trailing stop loss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss activated" })
		} else if (position.side == -1 && currentSymbolPrice < oneRatioTwoPrice) {
			position.trailingStopLoss = position.price - position.stopLoss // 1:1 will be our trailing stop loss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss activated" })
		}
	} else {
		const nextRatioPrice = position.side == 1 ? position.trailingStopLoss + position.stopLoss * 2 : position.trailingStopLoss - position.stopLoss * 2
		if (position.side == 1 && currentSymbolPrice > nextRatioPrice) {
			position.trailingStopLoss = position.trailingStopLoss + position.stopLoss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss shifted" })
		} else if (position.side == -1 && currentSymbolPrice < nextRatioPrice) {
			position.trailingStopLoss = position.trailingStopLoss - position.stopLoss
			await updatePosition({ ...position, status: positionStatuses.trailingPositionStopLoss, message: "Trailing stop loss shifted" })
		}
	}
	// const typesOfTrailing = ["simple", "decremental", "fibonacci"]
}
