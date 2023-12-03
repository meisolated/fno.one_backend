import chatter from "../../events"
import { isCurrentTimeIsInMarketHours, isTodayHoliday } from "../../provider/marketData.provider"

export default async function (user: any, newPositionDetails: iNewPositionDetails) {
	const _isTodayHoliday = await isTodayHoliday()
	const _isCurrentTimeIsInMarketHours = await isCurrentTimeIsInMarketHours()
	if (_isTodayHoliday || !_isCurrentTimeIsInMarketHours) {
		chatter.emit("positionManager-", "positionRejectedByRiskManager", {
			status: "rejectedByRiskManager",
			message: "Today is holiday or current time is not in market hours.",
			positionDetails: newPositionDetails,
			userId: user._id,
		})
		return false
	}
	chatter.emit("positionManager-", "positionApprovedByRiskManager", {
		status: "approvedByRiskManager",
		message: "Trade approved by Risk manager",
		positionDetails: newPositionDetails,
		userId: user._id,
	})
	return true
}
