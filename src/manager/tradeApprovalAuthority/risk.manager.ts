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
		// await updatePosition({ ...newPositionDetails, status: "rejectedByRiskManager", message: "Settings not found" })
		return { status: false, position: { ...newPositionDetails, status: "rejectedByRiskManager", message: "Settings not found" } }
	}

	if (_isTodayHoliday || !_isCurrentTimeIsInMarketHours) {
		const absoluteReason = _isTodayHoliday ? "Today is holiday" : "Current time is not in market hours"
		// await updatePosition({ ...newPositionDetails, status: "rejectedByRiskManager", message: absoluteReason })
		if (settings.developmentMode) {
			return { status: true, position: { ...newPositionDetails, status: "rejectedByRiskManager", message: absoluteReason } }
		} else {
			return {
				status: false, position: { ...newPositionDetails, status: "rejectedByRiskManager", message: absoluteReason }

			}
		}
	}
	if (settings.developmentMode) {
		const baseQuantity = getBaseQuantity(newPositionDetails.symbol)
		// await updatePosition({ ...newPositionDetails, quantity: baseQuantity, status: "modificationDoneByRiskManager", message: "Development mode is on, So quantity will be modified to the minimums." })
		return { status: true, position: { ...newPositionDetails, quantity: baseQuantity, status: "modificationDoneByRiskManager", message: "Development mode is on, So quantity will be modified to the minimums." } }
	}
	// await updatePosition({ ...newPositionDetails, status: "approvedByRiskManager", message: "Trade approved by Risk manager" })
	return { status: true, position: { ...newPositionDetails, status: "approvedByRiskManager", message: "Trade approved by Risk manager" } }
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
