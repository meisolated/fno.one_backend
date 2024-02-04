import { Trades } from "../../../model"
import { _ordersList, _positionsList, _tradesList, updatePosition } from "../position.manager"
export default async function (tradeData: iFyersSocketTradeUpdateData) {
	try {
		const _tradeDataToSave: iTrade = {
			positionId: 0,
			id: "0",
			userId: tradeData.userId,
			symbol: tradeData.symbol,
			orderDateTime: tradeData.orderDateTime,
			orderNumber: tradeData.orderNumber,
			tradeNumber: tradeData.tradeNumber,
			tradePrice: tradeData.tradePrice,
			tradeValue: tradeData.tradeValue,
			tradeQuantity: tradeData.tradeQuantity,
			side: tradeData.orderSide,
			productType: tradeData.productType,
			exchangeOrderNo: tradeData.exchangeOrderNo,
			segment: tradeData.segment,
			exchange: tradeData.exchange,
		}
		await Trades.create(_tradeDataToSave)
	} catch (error) {
		console.log(error)
	}
}
