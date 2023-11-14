import { tradesChatterInstance } from "../../events"
import { isTodayHoliday } from "../../provider/marketData.provider"
let lastTradeRequest: any = null

export default async function (user: any, newTradeDetails: any) {
	// to be done later, so approving all trades for now

	const _isTodayHoliday = await isTodayHoliday()
	if (_isTodayHoliday) {
		tradesChatterInstance.emit("tradeManager-", "tradeRejected", { status: "rejected", message: "Today is holiday", tradeDetails: newTradeDetails, userId: user._id })
		return false
	}
	tradesChatterInstance.emit("tradeManager-", "tradeApprovedByRiskManager", {
		status: "approvedByRiskManager",
		message: "Trade approved by Risk manager",
		tradeDetails: newTradeDetails,
		userId: user._id,
	})
	return true
}
