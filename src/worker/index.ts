import { getFunds } from "../lib/fyers"
import logger from "../logger"
import { User } from "../model"
import { isMarketOpen } from "../provider/marketData.provider"
import marketAlerts from './marketAlerts.worker'
import { updateHistoricalData } from "./updateHistoricalData.worker"
import updateSymbolLTP from "./updateSymbolLTP.worker"

// export const periodicUpdatesWorker = () => {
// 	//user funds update
// 	setInterval(async () => {
// 		const marketOpen = await isMarketOpen()
// 		if (marketOpen) {
// 			const user = await User.find({})
// 			user.forEach(async (user) => {
// 				try {
// 					const userFunds = await getFunds(user.userAppsData.fyers.accessToken)

// 					// funds update
// 					user.funds.fyers.total = userFunds.fund_limit.filter((fund: any) => fund.id === 1)[0].equityAmount
// 					user.funds.fyers.available = userFunds.fund_limit.filter((fund: any) => fund.id === 10)[0].equityAmount
// 					user.funds.fyers.used = userFunds.fund_limit.filter((fund: any) => fund.id === 2)[0].equityAmount

// 					// percentage of funds to use
// 					user.moneyManager.fundsToUse = (user.funds.fyers.available * (user.moneyManager.percentageOfFundsToUse / 100)).toFixed(2)
// 					user.positionTypeSettings.long.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.long.percentageOfFundsToUse / 100)).toFixed(2)
// 					user.positionTypeSettings.scalping.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.scalping.percentageOfFundsToUse / 100)).toFixed(2)
// 					user.positionTypeSettings.swing.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.swing.percentageOfFundsToUse / 100)).toFixed(2)
// 					user.positionTypeSettings.expiry.fundsToUse = (user.funds.fyers.available * (user.positionTypeSettings.expiry.percentageOfFundsToUse / 100)).toFixed(2)

// 					await user.save()
// 				} catch (error) {
// 					console.log(error)
// 				}
// 			})
// 		}
// 	}, 1000 * 60) // 1 minute
// }

export { marketAlerts, updateHistoricalData, updateSymbolLTP }
