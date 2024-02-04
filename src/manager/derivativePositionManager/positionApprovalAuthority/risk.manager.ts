import { indiesConfig } from "../../../config/symbols"
import chatter from "../../../events"
import { Positions, Settings } from "../../../model"
import { isCurrentTimeIsInMarketHours, isTodayHoliday } from "../../../provider/marketData.provider"
import { beforePositionOrderFilledStatuses, closedPositionStatuses, inPositionStatues } from "../position.manager"

/**
 * ?---------------------------------------------------------| TODO: |----------------------------------------------------------------|
 * TODO we need to add a function that can generate logical support and resistance for the index markets like BANKNIFTY , NIFTY50 and FINNIFTY
 * TODO based on that data we can approve or reject the trade
 * TODO also we can add major round levels like for banknifty X500 and X000 levels similar for nifty50 and finnifty
 */

export default async function (positionId: number, user: iUser, newPositionDetails: iPosition) {
	const _isTodayHoliday = await isTodayHoliday()
	const _isCurrentTimeIsInMarketHours = await isCurrentTimeIsInMarketHours()
	const settings = await Settings.findOne({ userId: user._id })
	const numberOfPositions = await getUserNumberOfTradesExecutedToday(user._id)
	if (!settings) {
		return { status: false, position: { ...newPositionDetails, status: "rejectedByRiskManager", message: "Settings not found" } }
	}
	if (settings.developmentMode) {
		const baseQuantity = getBaseQuantity(newPositionDetails.symbol, 1)
		return {
			status: true,
			position: { ...newPositionDetails, quantity: baseQuantity, status: "modificationDoneByRiskManager", message: "Development mode is on, So quantity will be modified to the minimums." },
		}
	}
	if (numberOfPositions >= user.riskManager.numberOfTradesAllowedPerDay) {
		return { status: false, position: { ...newPositionDetails, status: "rejectedByRiskManager", message: "Number of trades allowed per day is reached" } }
	}

	if (_isTodayHoliday || !_isCurrentTimeIsInMarketHours) {
		const absoluteReason = _isTodayHoliday ? "Today is holiday" : "Current time is not in market hours"
		return {
			status: false,
			position: { ...newPositionDetails, status: "rejectedByRiskManager", message: absoluteReason },
		}
	}
	return { status: true, position: { ...newPositionDetails, status: "approvedByRiskManager", message: "Trade approved by Risk manager" } }
}

async function getUserNumberOfTradesExecutedToday(id: string) {
	const today = new Date()
	const startTime = new Date(today.setHours(9, 15, 0, 0))
	const endTime = new Date(today.setHours(15, 30, 0, 0))
	const numberOfPositions = await Positions.countDocuments({
		status: { $in: [...inPositionStatues, ...closedPositionStatuses] },
		paper: false,
		userId: id,
		createdAt: {
			$gte: startTime,
			$lt: endTime,
		},
	}).countDocuments()

	return numberOfPositions
}

function checks(user: iUser, newPositionDetails: iPosition) {
	let modifiedPositionDetails = newPositionDetails
	const checksArray = {
		isCurrentTimeIsInMarketHours: async () => {
			const _isCurrentTimeIsInMarketHours = await isCurrentTimeIsInMarketHours()
			if (!_isCurrentTimeIsInMarketHours) {
				return {
					status: false,
					message: "Current time is not in market hours",
				}
			} else {
				return {
					status: true,
					message: "Current time is in market hours",
				}
			}
		},
		isTodayHoliday: async () => {
			const _isTodayHoliday = await isTodayHoliday()
			if (_isTodayHoliday) {
				return {
					status: false,
					message: "Today is holiday",
				}
			} else {
				return {
					status: true,
					message: "Today is not holiday",
				}
			}
		},
		isMaxAllowedTradesReached: async (user: iUser) => {
			const numberOfPositions = await Positions.countDocuments({
				status: { $in: [...inPositionStatues, ...closedPositionStatuses, ...beforePositionOrderFilledStatuses] },
				paper: false,
				userId: user._id,
				createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
			}).countDocuments()
			if (numberOfPositions >= user.riskManager.numberOfTradesAllowedPerDay) {
				return {
					status: false,
					message: "Number of trades allowed per day is reached",
				}
			} else {
				return {
					status: true,
					message: "Number of trades allowed per day is not reached",
				}
			}
		},
		isDevelopmentMode: async (newPositionDetails: iPosition) => {
			const settings = await Settings.findOne({ id: 1 })
			if (!settings) return { status: false, message: "Settings not found" }
			if (settings.developmentMode) {
				const baseQuantity = getBaseQuantity(newPositionDetails.symbol, 2)
				return {
					status: true,
					position: {
						...newPositionDetails,
						quantity: baseQuantity,
						status: "modificationDoneByRiskManager",
						message: "Development mode is on, So quantity will be modified to the minimums.",
					},
				}
			}
		},
	}
}
const getBaseQuantity = (symbol: string, multiplier: number) => {
	const match = symbol.match(/([A-Z]+)\d+/)
	if (match) {
		const indiesKey = match[1]
		const indiesInfo = indiesConfig[indiesKey]

		if (indiesInfo) {
			return indiesInfo.lotSize * multiplier
		}
	}
	chatter.emit("positionManager-", "log", { status: "error", message: "Symbol not found in indiesConfig", symbol })
	return 0
}

function isTheCurrentPriceOfTheIndexNearRoundLevels(symbol: string) {}
