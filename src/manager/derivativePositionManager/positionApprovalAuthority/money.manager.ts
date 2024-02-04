import { getFyersUserProfitOrLossOfTheDay, updateFyersUserBrokerFunds } from "../../../handler/fyers.handler"
import { Settings } from "../../../model"

export default async function (positionId: number, user: iUser, newPositionDetails: iPosition) {
	/**
	 * first update user funds
	 * then check if new trade funds requirement is less than allowed funds
	 * also check how much funds are utilized
	 */
	const _updateUserBrokerFunds = await updateFyersUserBrokerFunds(user)
	const _fyersUserProfitOrLoss = await getFyersUserProfitOrLossOfTheDay(user)
	const settings = await Settings.findOne({ id: 1 })

	if (!settings) {
		return { status: false, position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: "Settings not found" } }
	}

	if (!_fyersUserProfitOrLoss || !_updateUserBrokerFunds) {
		const _error = "Error while updating user funds or getting user profit or loss"
		const _errorIn = _updateUserBrokerFunds
			? "getFyersUserProfitOrLossOfTheDay"
			: _fyersUserProfitOrLoss
			? "updateFyersUserBrokerFunds"
			: "updateFyersUserBrokerFunds and getFyersUserProfitOrLossOfTheDay"

		if (settings.developmentMode) {
			return { status: true, position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: _error + _errorIn } }
		} else {
			return { status: false, position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: _error + _errorIn } }
		}
	} else {
		const _totalFunds = user.funds.fyers.total
		const _availableFunds = user.funds.fyers.available
		const _usedFunds = user.funds.fyers.used

		// check if we had loss or profit today
		// ! to be improved later
		if (_fyersUserProfitOrLoss.realized > 0) {
			const percentageOfProfit = (_fyersUserProfitOrLoss.realized / (_availableFunds + _usedFunds)) * 100
			if (percentageOfProfit > user.riskManager.percentageOfMaxProfitPerDay) {
				if (settings.developmentMode) {
					return {
						status: true,
						position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: `Profit is more than ${user.riskManager.percentageOfMaxProfitPerDay}% of total funds` },
					}
				} else {
					return {
						status: false,
						position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: `Profit is more than ${user.riskManager.percentageOfMaxProfitPerDay}% of total funds` },
					}
				}
			}

			return {
				status: true,
				position: { ...newPositionDetails, status: "approvedByMoneyManager", message: `Profit is less than ${user.riskManager.percentageOfMaxProfitPerDay}% of total funds` },
			}
		} else {
			const percentageOfLoss = Math.abs((_fyersUserProfitOrLoss.realized / (_availableFunds + _usedFunds)) * 100)
			if (percentageOfLoss > user.riskManager.percentageOfMaxLossPerDay) {
				if (settings.developmentMode) {
					return {
						status: true,
						position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: `Loss is more than ${user.riskManager.percentageOfMaxLossPerDay}% of total funds` },
					}
				} else {
					return {
						status: false,
						position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: `Loss is more than ${user.riskManager.percentageOfMaxLossPerDay}% of total funds` },
					}
				}
			}
			return { status: true, position: { ...newPositionDetails, status: "approvedByMoneyManager", message: `Loss is less than ${user.riskManager.percentageOfMaxLossPerDay}% of total funds` } }
		}
	}
}
