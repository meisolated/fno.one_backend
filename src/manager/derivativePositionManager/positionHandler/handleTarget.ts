import { exitPosition, positionStatuses, updatePosition } from "../position.manager"

export default async function (position: iPosition, marketTick: iSymbolTicks) {
	const target = position.stopLoss * position.riskToRewardRatio
	const targetPrice = position.side == 1 ? position.price + target : position.price - target
	const stopLoss = position.side == 1 ? position.price - position.stopLoss : position.price + position.stopLoss
	const currentPrice = marketTick.lp
	console.log("currentPrice", currentPrice, "stopLoss", stopLoss, "targetPrice", targetPrice, "positionId", position.id, "positionStatus", position.status)
	if (position.side == 1 && currentPrice >= targetPrice) {
		console.log("target hit")
		await updatePosition({ ...position, status: positionStatuses.positionClosedWithTarget, message: "Position closed with target" })
		await exitPosition(position.userId, position, "positive")
	} else if (position.side == -1 && currentPrice <= targetPrice) {
		console.log("target hit")
		await updatePosition({ ...position, status: positionStatuses.positionClosedWithTarget, message: "Position closed with target" })
		await exitPosition(position.userId, position, "positive")
	}
}
