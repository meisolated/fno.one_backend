import * as fyers from "../../lib/broker/fyers"
import logger from "../../logger"
import { User } from "../../model"

const singleOrderMaxQuantity = 900

export const placeOrder = async (userId: string, orderDetails: iSingleOrder) => {
	const userData = await User.findOne({ _id: userId })
	if (!userData) return false
	const orderPlacementResponse = await fyers.placeSingleOrder(userData?.userAppsData.fyers.accessToken, orderDetails)
	return orderPlacementResponse
}
export const cancelOrder = async (userId: string, orderId: iCancelOrder) => {
	const userData = await User.findOne({ _id: userId })
	if (!userData) return false
	const orderCancellationResponse = await fyers.cancelSingleOrder(userData?.userAppsData.fyers.accessToken, orderId)
	if (orderCancellationResponse.s != "ok" && orderCancellationResponse.code != 200) return false
}
export const exitPositionById = async (positionId: string) => {}
export const placeMultiOrder = async (orderDetails: iSingleOrder[]) => {}
export const cancelMultiOrder = async (orderDetails: iSingleOrder[]) => {}
export const getOrders = async (userId: string) => {}
export const getOrderById = async (userId: string, orderId: string) => {}

export const punchOrder = async (userId: string, orderDetails: iSingleOrder) => {
	if (orderDetails.qty <= singleOrderMaxQuantity) {
	} else {
		logger.error("------------------------------------------------------------------")
		logger.error("---------------- Above 900 Qty is not tested yet -----------------")
		logger.error("------------------------------------------------------------------")
		const lots = splitQuantity(singleOrderMaxQuantity, orderDetails.qty)
	}
}

function splitQuantity(lot: number, quantity: number): number[] {
	const lots: number[] = []
	while (quantity > 0) {
		const currentLotSize = Math.min(lot, quantity)
		quantity -= currentLotSize
		lots.push(currentLotSize)
	}
	return lots
}
