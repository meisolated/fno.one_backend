import { indiesConfig } from "../../config/symbols"
import chatter from "../../events"
import { Settings } from "../../model"
import { isCurrentTimeIsInMarketHours, isTodayHoliday } from "../../provider/marketData.provider"
import { updatePosition } from "../position.manager"

export default async function (positionId: number, user: any, newPositionDetails: iPosition) {
	const _isTodayHoliday = await isTodayHoliday()
	const _isCurrentTimeIsInMarketHours = await isCurrentTimeIsInMarketHours()
	const settings = await Settings.findOne({ userId: user._id })

	if (!settings) {
		updatePosition({ ...newPositionDetails, status: "rejectedByRiskManager", message: "Settings not found" })
		return false
	}

	if (_isTodayHoliday || !_isCurrentTimeIsInMarketHours) {
		const absoluteReason = _isTodayHoliday ? "Today is holiday" : "Current time is not in market hours"
		updatePosition({ ...newPositionDetails, status: "rejectedByRiskManager", message: absoluteReason })
		if (settings.developmentMode) return true
		return false
	}

	if (settings.developmentMode) {
		const baseQuantity = getBaseQuantity(newPositionDetails.symbol)
		updatePosition({ ...newPositionDetails, quantity: baseQuantity, status: "modificationDoneByRiskManager", message: "Development mode is on, So quantity will be modified to the minimums." })
	}
	updatePosition({ ...newPositionDetails, status: "approvedByRiskManager", message: "Trade approved by Risk manager" })
	return true
}

const getBaseQuantity = (symbol: string) => {
	const match = symbol.match(/([A-Z]+)\d+/)
	if (match) {
		const indiesKey = match[1]
		const indiesInfo = indiesConfig[indiesKey]

		if (indiesInfo) {
			return indiesInfo.lotSize
		}
	}
	chatter.emit("positionManager-", "log", { status: "error", message: "Symbol not found in indiesConfig", symbol })
	return 0
}
