import chatter from "../events"
import logger from "../logger"
const trueDataMarketFeedsRealTimeDataProcessing = (data: any) => {
	const processData: symbolTicks = {
		symbol: data.Symbol,
		originalName: data.Symbol,
		shortName: data.Symbol,
		description: data.Symbol,
		exchange: "NSE",
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
		openPrice: data.Open,
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
	chatter.emit("marketData-", "tick", processData)
	return processData
}
const trueDataMarketFeedsHandleTouchlineDataProcessing = (data: any) => {
	const processData: trueDataMarketFeedsTouchlineData = {
		symbol: data.Symbol,
		lastUpdateTime: data.LastUpdateTime,
		LTP: data.LTP,
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
	return processData
}
const trueDataMarketFeedsHandleBidAskDataProcessing = (data: any) => {
	const processData: trueDataMarketFeedsBidAskData = {
		symbol: data.Symbol,
		time: data.Time,
		bid: data.Bid,
		bidQty: data.BidQty,
		ask: data.Ask,
		askQty: data.AskQty,
	}
	return processData
}
const trueDataHandleBarDataProcessing = (data: any) => {
	const processData: trueDataHandleBarData = {
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
export { trueDataHandleBarDataProcessing, trueDataMarketFeedsHandleBidAskDataProcessing, trueDataMarketFeedsHandleTouchlineDataProcessing, trueDataMarketFeedsRealTimeDataProcessing }
