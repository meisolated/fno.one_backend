import { indiesConfig } from "../../config/symbols"
import chatter from "../../events"
import { Positions, Settings } from "../../model"
import { isCurrentTimeIsInMarketHours, isTodayHoliday } from "../../provider/marketData.provider"

export default async function (positionId: number, user: any, newPositionDetails: iPosition) {
	const _isTodayHoliday = await isTodayHoliday()
	const _isCurrentTimeIsInMarketHours = await isCurrentTimeIsInMarketHours()
	const settings = await Settings.findOne({ userId: user._id })
	if (_isTodayHoliday || !_isCurrentTimeIsInMarketHours) {
		chatter.emit("positionManager-", "positionRejectedByRiskManager", {
			status: "rejectedByRiskManager",
			message: "Today is holiday or current time is not in market hours.",
			positionDetails: newPositionDetails,
			userId: user._id,
		})
		await Positions.findOneAndUpdate(
			{ id: positionId },
			{
				status: "rejectedByRiskManager",
				message: "Today is holiday or current time is not in market hours.",
			},
		)
		return false
	}
	if (!settings) {
		chatter.emit("positionManager-", "positionRejectedByRiskManager", {
			status: "rejectedByRiskManager",
			message: "Settings not found",
			positionDetails: newPositionDetails,
			userId: user._id,
		})
		await Positions.findOneAndUpdate(
			{ id: positionId },
			{
				status: "rejectedByRiskManager",
				message: "Settings not found",
			},
		)
		return false
	}
	if (settings.developmentMode) {
		chatter.emit("positionManager-", "log", {
			status: "info",
			message: "Development mode is on, So quantity will be modified to the minimums.",
			positionDetails: newPositionDetails,
			userId: user._id,
		})
		const baseQuantity = getBaseQuantity(newPositionDetails.symbol)
		newPositionDetails.quantity = baseQuantity
		await Positions.findOneAndUpdate(
			{ id: positionId },
			{
				quantity: baseQuantity,
			},
		)
	}
	await Positions.findOneAndUpdate(
		{ id: positionId },
		{
			status: "approvedByRiskManager",
			message: "Trade approved by Risk manager",
		},
	)
	chatter.emit("positionManager-", "positionApprovedByRiskManager", {
		status: "approvedByRiskManager",
		message: "Trade approved by Risk manager",
		positionDetails: newPositionDetails,
		userId: user._id,
	})
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
