import { tradesChatterInstance } from "../../events"
import { getFyersUserProfitOrLossOfTheDay, updateFyersUserBrokerFunds } from "../../handler/fyers.handler"
import sensitiveLog from "../../logger/sensitiveLog"
export default async function (user: any, newTradeDetails: any) {
	/**
	 * first update user funds
	 * then check if new trade funds requirement is less than allowed funds
	 * also check how much funds are utilized
	 */
	const _updateUserBrokerFunds = await updateFyersUserBrokerFunds(user)
	const _fyersUserProfitOrLoss = await getFyersUserProfitOrLossOfTheDay(user)

	if (!_fyersUserProfitOrLoss || !_updateUserBrokerFunds) {
		const _error = "Error while updating user funds or getting user profit or loss"
		const _errorIn = _updateUserBrokerFunds
			? "getFyersUserProfitOrLossOfTheDay"
			: _fyersUserProfitOrLoss
				? "updateFyersUserBrokerFunds"
				: "updateFyersUserBrokerFunds and getFyersUserProfitOrLossOfTheDay"
		tradesChatterInstance.emit("tradeManager-", "log", { status: "rejectedByMoneyManager", message: _error + _errorIn, tradeDetails: newTradeDetails, userId: user._id })
		return false
	} else {
		const _totalFunds = user.funds.fyers.total
		const _availableFunds = user.funds.fyers.available
		const _usedFunds = user.funds.fyers.used

		// check if we had loss or profit today
		// ! to be improved later
		if (_fyersUserProfitOrLoss.realized > 0) {
			const percentageOfProfit = (_fyersUserProfitOrLoss.realized / _totalFunds) * 100
			if (percentageOfProfit > 5) {
				tradesChatterInstance.emit("tradeManager-", "log", {
					status: "rejectedByMoneyManager",
					message: "Profit is more than 5% of total funds",
					tradeDetails: newTradeDetails,
					userId: user._id,
				})
				return false
			}
			tradesChatterInstance.emit("tradeManager-", "log", {
				status: "approvedByMoneyManager",
				message: "Profit is less than 5% of total funds",
				tradeDetails: newTradeDetails,
				userId: user._id,
			})
			return true
		}
		tradesChatterInstance.emit("tradeManager-", "tradeApprovedByMoneyManager", { status: "approvedByMoneyManager", message: "Profit is less than 5% of total funds", tradeDetails: newTradeDetails, userId: user._id })
		return true
	}
}
