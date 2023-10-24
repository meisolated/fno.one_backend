import { getFunds } from "../lib/fyers"
import logger from "../logger"
import { User } from "../model"
import { isMarketOpen } from "../provider/marketData.provider"
import { updateHistoricalData } from "./updateHistoricalData.worker"
import updateSymbolLTP from "./updateSymbolLTP.worker"

export const periodicUpdatesWorker = () => {
	//user funds update
	setInterval(async () => {
		const marketOpen = await isMarketOpen()
		if (marketOpen) {
			const user = await User.find({})
			user.forEach(async (user) => {
				try {
					const userFunds = await getFunds(user.userAppsData.fyers.accessToken)

					// funds update
					user.funds.fyers.total = userFunds.fund_limit.filter((fund: any) => fund.id === 1)[0].equityAmount
					user.funds.fyers.available = userFunds.fund_limit.filter((fund: any) => fund.id === 10)[0].equityAmount
					user.funds.fyers.used = userFunds.fund_limit.filter((fund: any) => fund.id === 2)[0].equityAmount

					// percentage of funds to use
					user.moneyManager.fundsToUse = (user.funds.fyers.available * (user.moneyManager.percentageOfFundsToUse / 100)).toFixed(2)
					user.positionTypeSettings.longPosition.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.longPosition.percentageOfFundsToUse / 100)).toFixed(2)
					user.positionTypeSettings.scalpingPosition.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.scalpingPosition.percentageOfFundsToUse / 100)).toFixed(2)
					user.positionTypeSettings.swingPosition.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.swingPosition.percentageOfFundsToUse / 100)).toFixed(2)
					user.positionTypeSettings.expiryPosition.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.expiryPosition.percentageOfFundsToUse / 100)).toFixed(2)

					await user.save()
				} catch (error) {
					console.log(error)
				}
			})
		}
	}, 1000 * 10) //10 seconds
}

export { updateHistoricalData, updateSymbolLTP }
