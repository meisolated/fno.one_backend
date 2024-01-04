import chatter from "../events"
import logger from "../logger"
export const fyersSocketOrderUpdateDataProcessing = (orderData: any, userId: string) => {
	const processData: iFyersSocketOrderUpdateData = {
		userId: userId,
		orderId: orderData.id,
		exchangeOrderId: orderData.exchOrdId,
		symbol: orderData.symbol,
		quantity: orderData.qty,
		remainingQuantity: orderData.remainingQuantity,
		filledQuantity: orderData.filledQty,
		status: orderData.status,
		message: orderData.message,
		segment: orderData.segment,
		limitPrice: orderData.limitPrice,
		stopPrice: orderData.stopPrice,
		productType: orderData.productType,
		orderType: orderData.type,
		orderSide: orderData.side,
		orderValidity: orderData.orderValidity,
		orderDateTime: orderData.orderDateTime,
		tradedPrice: orderData.tradedPrice,
		source: orderData.source,
		fyToken: orderData.fyToken,
		parentId: orderData.parentId,
		offlineOrder: orderData.offlineOrder,
		pan: orderData.pan,
		clientId: orderData.clientId,
		exchange: orderData.exchange,
		instrument: orderData.instrument,
	}
	chatter.emit("fyersOrderUpdateSocket-", "order", processData)
	return processData
}
export const fyersSocketPositionsUpdateDataProcessing = (positionData: any, userId: string) => {
	const processData: iFyersSocketPositionUpdateData = {
		userId: userId,
		symbol: positionData.symbol,
		positionId: positionData.id,
		buyAvg: positionData.buyAvg,
		buyQty: positionData.buyQty,
		sellAvg: positionData.sellAvg,
		sellQty: positionData.sellQty,
		netAvg: positionData.netAvg,
		netQty: positionData.netQty,
		side: positionData.side,
		qty: positionData.qty,
		productType: positionData.productType,
		realizedProfit: positionData.realized_profit,
		pl: positionData.pl,
		crossCurrency: positionData.crossCurrency,
		rbiRefRate: positionData.rbiRefRate,
		qtyMultiCom: positionData.qtyMulti_com,
		segment: positionData.segment,
		exchange: positionData.exchange,
		slNo: positionData.slNo,
		ltp: positionData.ltp,
		fyToken: positionData.fyToken,
		cfBuyQty: positionData.cfBuyQty,
		cfSellQty: positionData.cfSellQty,
		dayBuyQty: positionData.dayBuyQty,
		daySellQty: positionData.daySellQty,
	}
	chatter.emit("fyersOrderUpdateSocket-", "position", processData)
	return processData
}

export const fyersSocketTradeUpdateDataProcessing = (tradeData: any, userId: string) => {
	const processData: iFyersSocketTradeUpdateData = {
		id: tradeData.id,
		userId: userId,
		symbol: tradeData.symbol,
		tradeId: tradeData.id,
		orderDateTime: tradeData.orderDateTime,
		orderNumber: tradeData.orderNumber,
		tradeNumber: tradeData.tradeNumber,
		tradePrice: tradeData.tradePrice,
		tradeValue: tradeData.tradeValue,
		tradeQuantity: tradeData.tradedQty,
		orderSide: tradeData.side,
		productType: tradeData.productType,
		exchangeOrderNo: tradeData.exchangeOrderNo,
		segment: tradeData.segment,
		exchange: tradeData.exchange,
		fyToken: tradeData.fyToken,
	}
	chatter.emit("fyersOrderUpdateSocket-", "trade", processData)
	return processData
}
export const fyersSocketGeneralDataProcessing = (data: any, userId: string) => {
	console.log("Unknown Data: ", data)
	if (data.code == 1605) {
		logger.info("Fyers Subscription Successful", "FyersOrderSocketDPU")
	}
	chatter.emit("fyersOrderUpdateSocket-", "general", { data, userId })
	return { data, userId }
}
