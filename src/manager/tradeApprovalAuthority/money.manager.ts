import { getFyersUserProfitOrLossOfTheDay, updateFyersUserBrokerFunds } from "../../handler/fyers.handler"
import { Settings } from "../../model"
import { updatePosition } from "../position.manager"
export default async function (positionId: number, user: any, newPositionDetails: iPosition) {
	/**
	 * first update user funds
	 * then check if new trade funds requirement is less than allowed funds
	 * also check how much funds are utilized
	 */
	const _updateUserBrokerFunds = await updateFyersUserBrokerFunds(user)
	const _fyersUserProfitOrLoss = await getFyersUserProfitOrLossOfTheDay(user)
	const settings = await Settings.findOne({ id: 1 })

	if (!settings) {
		// await updatePosition({ ...newPositionDetails, status: "rejectedByMoneyManager", message: "Settings not found" })
		return { status: false, position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: "Settings not found" } }
	}

	if (!_fyersUserProfitOrLoss || !_updateUserBrokerFunds) {
		const _error = "Error while updating user funds or getting user profit or loss"
		const _errorIn = _updateUserBrokerFunds
			? "getFyersUserProfitOrLossOfTheDay"
			: _fyersUserProfitOrLoss
				? "updateFyersUserBrokerFunds"
				: "updateFyersUserBrokerFunds and getFyersUserProfitOrLossOfTheDay"

		// await updatePosition({ ...newPositionDetails, status: "rejectedByMoneyManager", message: _error + _errorIn })
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
			const percentageOfProfit = (_fyersUserProfitOrLoss.realized / _totalFunds) * 100
			if (percentageOfProfit > 5) {
				// await updatePosition({ ...newPositionDetails, status: "rejectedByMoneyManager", message: "Profit is more than 5% of total funds" })
				if (settings.developmentMode) {
					return { status: true, position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: "Profit is more than 5% of total funds" } }
				} else {
					return { status: false, position: { ...newPositionDetails, status: "rejectedByMoneyManager", message: "Profit is more than 5% of total funds" } }

				}
			}

			// await updatePosition({ ...newPositionDetails, status: "approvedByMoneyManager", message: "Profit is less than 5% of total funds" })
			return { status: true, position: { ...newPositionDetails, status: "approvedByMoneyManager", message: "Profit is less than 5% of total funds" } }
		}

		// await updatePosition({ ...newPositionDetails, status: "approvedByMoneyManager", message: "Profit is less than 5% of total funds" })
		return { status: true, position: { ...newPositionDetails, status: "approvedByMoneyManager", message: "Profit is less than 5% of total funds" } }
	}
}
