import logger from "../logger"
import sensitiveLog from "../logger/sensitiveLog"
import chatter, { tradesChatterInstance } from "./"

export default async () => {
	logger.info("Loaded Trade Manager", "Event Handler")
	tradesChatterInstance.on("tradeManager-", "newTradeDetails", async (newTradeDetails: any) => {
		if (!newTradeDetails.userId) return sensitiveLog("New Trade information received but user Id  not found")
	})
	tradesChatterInstance.on("tradeManager-", "tradeApprovedByMoneyManager", async (newTradeDetails: any) => {
		console.log("tradeApprovedByMoneyManager")
		if (!newTradeDetails.userId) return sensitiveLog("New Trade information received but user Id  not found")
		chatter.emit("newTradeUpdates", "", {
			userId: newTradeDetails.userId,
			status: newTradeDetails.status,
			message: newTradeDetails.message,
			tradeDetails: newTradeDetails.tradeDetails
		})
	})
	tradesChatterInstance.on("tradeManager-", "tradeApprovedByRiskManager", async (newTradeDetails: any) => {
		console.log("tradeApprovedByRiskManager")
		if (!newTradeDetails.userId) return sensitiveLog("New Trade information received but user Id  not found")
		chatter.emit("newTradeUpdates", "", {
			userId: newTradeDetails.userId,
			status: newTradeDetails.status,
			message: newTradeDetails.message,
			tradeDetails: newTradeDetails.tradeDetails
		})
	})

	tradesChatterInstance.on("tradeManager-", "tradeApproved", async (newTradeDetails: any) => {
		console.log("tradeApproved")
		if (!newTradeDetails.userId) return sensitiveLog("New Trade information received but user Id  not found")
		chatter.emit("newTradeUpdates", "", {
			userId: newTradeDetails.userId,
			status: newTradeDetails.status,
			message: newTradeDetails.message,
			tradeDetails: newTradeDetails.tradeDetails
		})
	})
	tradesChatterInstance.on("tradeManager-", "tradeRejected", async (newTradeDetails: any) => {
		console.log("tradeRejected")
		if (!newTradeDetails.userId) return sensitiveLog("New Trade information received but user Id  not found")
		chatter.emit("newTradeUpdates", "", {
			userId: newTradeDetails.userId,
			status: newTradeDetails.status,
			message: newTradeDetails.message,
			tradeDetails: newTradeDetails.tradeDetails
		})
	})

	tradesChatterInstance.on("tradeManager-", "log", async (newTradeDetails: any) => { })
}
