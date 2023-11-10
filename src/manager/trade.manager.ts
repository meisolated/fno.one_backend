import { tradesChatterInstance } from "../events"
import logger from "../logger"
import sensitiveLog from "../logger/sensitiveLog"
import { User } from "../model"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"
export default async () => {
	logger.info("Loaded Trade Manager", "Trade Manager")
	tradesChatterInstance.on("tradeManager-", "newTradeDetails", async (newTradeDetails: any) => {
		const user = await User.findById(newTradeDetails.userId)
		if (!user) return sensitiveLog({ message: "New Trade information received but user not found", data: newTradeDetails, userId: newTradeDetails.userId })
		tradesChatterInstance.emit("tradeManager-", "log", { message: "New trade details received", data: newTradeDetails, userId: user._id })
		// awaiting for money manager approval
		const moneyManagerApproval = await moneyManager(user, newTradeDetails)
		if (moneyManagerApproval) {
			tradesChatterInstance.emit("tradeManager-", "tradeApprovedByMoneyManager", {
				status: "approvedByMoneyManager",
				message: "Trade approved by money manager",
				data: newTradeDetails,
				userId: user._id,
			})
			// awaiting for risk manager approval
			const riskManagerApproval = await riskManager(user, newTradeDetails)
			if (riskManagerApproval) {
				tradesChatterInstance.emit("tradeManager-", "tradeApprovedByRiskManager", {
					status: "approvedByRiskManager",
					message: "Trade approved by risk manager",
					data: newTradeDetails,
					userId: user._id,
				})
				tradesChatterInstance.emit("tradeManager-", "tradeApproved", {
					status: "approved",
					message: "Trade approved by money manager and risk manager",
					data: newTradeDetails,
					userId: user._id,
				})
			}
		}
	})
}
