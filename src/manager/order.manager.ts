import * as fyers from "../lib/broker/fyers"
import { User } from "../model"

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
export const exitPositionById = async (positionId: string) => { }

export const placeMultiOrder = async (orderDetails: iSingleOrder[]) => { }
export const cancelMultiOrder = async (orderDetails: iSingleOrder[]) => { }
export const getOrders = async (userId: string) => { }
export const getOrderById = async (userId: string, orderId: string) => { }
/**
 * Position Types
 * 1 - Long Position : Stop Loss and Target not so aggressive and RR ratio above or equal to 1:2
 * 2 - Scalping Position : Stop Loss and Target very aggressive and RR ratio below 1:1 at most 1:1.5
 * 3 - Swing Position : Stop Loss and Target aggressive and RR ratio above or equal to 1:1.5
 */
