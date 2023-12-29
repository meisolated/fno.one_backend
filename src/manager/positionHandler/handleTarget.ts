import { exitPosition, positionStatuses, updatePosition } from "../position.manager"

export default async function (position: iPosition, marketTick: iSymbolTicks) {
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
