const trueDataMarketFeedsDataProcessing = (data: any) => {
	const processData: symbolTicks = {
		symbol: data.Symbol,
		original_name: data.Symbol,
		short_name: data.Symbol,
		description: data.Symbol,
		exchange: "NSE",
		high_price: data.High,
		low_price: data.Low,
		prev_close_price: data.Prev_Close,
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
		open_price: data.Open,
		lp: data.LTP,
		LTQ: data.LTQ,
		L2_LTT: new Date(data.Timestamp).getTime(),
		ATP: data.ATP,
		volume: data.Volume,
		tot_buy: data.Bid_Qty,
		tot_sell: data.Ask_Qty,
		bid: data.Bid,
		ask: data.Ask,
		spread: data.Ask - data.Bid,
		marketStat: 1,
	}
	return processData
}

export { trueDataMarketFeedsDataProcessing }
