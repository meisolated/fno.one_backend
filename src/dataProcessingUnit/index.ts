import { getConfigData } from "../config/initialize"
import chatter from "../events"
import { SymbolTicks } from "../model"
import { _trueDataSymbolToFyersSymbol } from "../provider/symbols.provider"
export const trueDataMarketFeedsRealTimeDataProcessing = (data: any) => {
	// console.log(data)
	// try {

	const processData: iSymbolTicks = {
		symbolId: data.Symbol_ID,
		symbol: data.Symbol,
		fySymbol: _trueDataSymbolToFyersSymbol[data.Symbol],
		originalName: data.Symbol,
		shortName: data.Symbol,
		description: data.Symbol,
		exchange: "NSE",
		openPrice: data.Open,
		highPrice: data.High,
		lowPrice: data.Low,
		prevClosePrice: data.Prev_Close,
		ch: data.LTP - data.Prev_Close,
		tt: new Date(data.Timestamp).getTime(),
		cmd: {
			c: data.LTP,
			h: data.High,
			l: data.Low,
			o: data.Open,
			t: new Date(data.Timestamp).getTime(),
			v: data.Volume,
			tf: "",
		},
		chp: ((data.LTP - data.Prev_Close) / data.Prev_Close) * 100,
		lp: data.LTP,
		LTQ: data.LTQ,
		L2LTT: new Date(data.Timestamp).getTime(),
		ATP: data.ATP,
		volume: data.Volume,
		totBuy: data.Bid_Qty,
		totSell: data.Ask_Qty,
		bid: data.Bid,
		ask: data.Ask,
		spread: data.Ask - data.Bid,
		marketStat: 1,
	}
	const conf = getConfigData()
	if (conf.keepRealTimeMarketsData) SymbolTicks.create(processData)
	chatter.emit("symbolUpdateTicks-", "tick", processData)
	return processData
	// } catch (error) {
	// 	logger.error("There is something wrong inside trueDataMarketFeedsRealTimeDataProcessing" + JSON.stringify(error), "dataProcessingUnit/index.ts")
	// }
}
export const trueDataMarketFeedsHandleTouchlineDataProcessing = (data: any) => {
	const processData: iTrueDataMarketFeedsTouchlineData = {
		symbolId: data.Symbol_ID,
		symbol: data.Symbol,
		fySymbol: _trueDataSymbolToFyersSymbol[data.Symbol],
		lastUpdateTime: data.LastUpdateTime,
		lp: data.LTP,
		tickVolume: data.TickVolume,
		ATP: data.ATP,
		totalVolume: data.TotalVolume,
		open: data.Open,
		high: data.High,
		low: data.Low,
		previousClose: data.Previous_Close,
		turnOver: data.TurnOver,
		bid: data.Bid,
		ask: data.Ask,
		bigQty: data.BigQty,
		askQty: data.AskQty,
	}
	chatter.emit("symbolUpdateTicks-", "touchline", processData)
	return processData
}
export const trueDataMarketFeedsHandleBidAskDataProcessing = (data: any) => {
	const processData: iTrueDataMarketFeedsBidAskData = {
		symbol: data.Symbol,
		time: data.Time,
		bid: data.Bid,
		bidQty: data.BidQty,
		ask: data.Ask,
		askQty: data.AskQty,
	}
	return processData
}
export const iTrueDataHandleBarDataProcessing = (data: any) => {
	const processData: iTrueDataHandleBarData = {
		symbol: data.Symbol,
		bar: data.Bar,
		time: data.Time,
		open: data.Open,
		high: data.High,
		low: data.Low,
		close: data.Close,
		volume: data.Volume,
		oi: data.OI,
	}
	return processData
}
