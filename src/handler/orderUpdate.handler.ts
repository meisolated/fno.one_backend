import { EventEmitter } from "events"
import chatter from "../events"
export default async function (userId: string, data: any) {
	if (typeof data == "undefined") return
	if (data.message == "TRADE_CONFIRMED") {
		const preparedData = {
			userId: userId,
			orderUpdateData: {
				symbol: data.symbol,
				orderID: data.id,
				side: data.side,
				quantity: data.qty,
				remainingQuantity: data.remainingQuantity,
				filledQuantity: data.filledQty,
				status: data.status,
				segment: data.segment,
				limitPrice: data.limitPrice,
				stopPrice: data.stopPrice,
				type: data.type,
				slNo: data.slNo,
				message: data.message,
				orderNumStatus: data.orderNumStatus,
				tradedPrice: data.tradedPrice,
			},
		}
		chatter.emit("fyersOrderHandler-", "orderUpdate", preparedData)
	}
}
