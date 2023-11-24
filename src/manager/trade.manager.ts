import { tradesChatterInstance } from "../events"
import logger from "../logger"
import sensitiveLog from "../logger/sensitiveLog"
import { User } from "../model"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"

export default async () => {
	logger.info("Loaded Trade Manager", "Trade Manager")
	tradesChatterInstance.on("tradeManager-", "newTradeDetails", async (newTradeDetails: iNewTradeDetails) => {
		const user = await User.findById(newTradeDetails.userId)
		if (!user) return sensitiveLog({ message: "New Trade information received but user not found", tradeDetails: newTradeDetails, userId: newTradeDetails.userId })
		tradesChatterInstance.emit("tradeManager-", "tradeDetailsReceived", { status: "received", message: "New trade details received", tradeDetails: newTradeDetails, userId: user._id })

		const moneyManagerApproval = await moneyManager(user, newTradeDetails)
		if (moneyManagerApproval) {
			const riskManagerApproval = await riskManager(user, newTradeDetails)
			if (riskManagerApproval) {
				return tradesChatterInstance.emit("tradeManager-", "tradeApproved", {
					status: "approved",
					message: "Trade approved by money manager and risk manager",
					tradeDetails: newTradeDetails,
					userId: user._id,
				})
			}
		}
	})
}



const positionStatuses = {
	sentToMoneyManager: "sentToMoneyManager",
	approvedByMoneyManager: "approvedByMoneyManager",
	rejectedByMoneyManager: "rejectedByMoneyManager",
	sentToRiskManager: "sentToRiskManager",
	approvedByRiskManager: "approvedByRiskManager",
	rejectedByRiskManager: "rejectedByRiskManager",
	orderBeingPlaced: "orderBeingPlaced",
	orderPlaced: "orderPlaced",
	orderRejected: "orderRejected",
	orderCancelled: "orderCancelled",
	orderFilled: "orderFilled",
	orderPartiallyFilled: "orderPartiallyFilled",
	orderPending: "orderPending",
	orderFailed: "orderFailed",
	orderExpired: "orderExpired",
	inPosition: "inPosition",
	positionClosed: "positionClosed",
	positionCancelled: "positionCancelled",
	positionFailed: "positionFailed",
	positionExpired: "positionExpired",
	handedOverToUser: "handedOverToUser",
}
const positionMessages = {
	sentToMoneyManager: "Sent to money manager",
	approvedByMoneyManager: "Approved by money manager",
	rejectedByMoneyManager: "Rejected by money manager",
	sentToRiskManager: "Sent to risk manager",
	approvedByRiskManager: "Approved by risk manager",
	rejectedByRiskManager: "Rejected by risk manager",
	orderBeingPlaced: "Order being placed",
	orderPlaced: "Order placed",
	orderRejected: "Order rejected",
	orderCancelled: "Order cancelled",
	orderFilled: "Order filled",
	orderPartiallyFilled: "Order partially filled",
	orderPending: "Order pending",
	orderFailed: "Order failed",
	orderExpired: "Order expired",
	inPosition: "In position",
	positionClosed: "Position closed",
	positionCancelled: "Position cancelled",
	positionFailed: "Position failed",
	positionExpired: "Position expired",
	handedOverToUser: "Handed over to user",
	positionNearStopLoss: "Position near stop loss",
	positionNearTarget: "Position near target",
	trailingPositionStopLoss: "Trailing position stop loss",
	positionClosedWithTarget: "Position closed with target",
	positionClosedWithStopLoss: "Position closed with stop loss",
	positionClosedWithTrailingStopLoss: "Position closed with trailing stop loss",
}
