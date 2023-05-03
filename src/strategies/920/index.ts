export default {
    version: 1,
    name: "920",
    marketDataInterval: 3 * 60, // 3 minutes
    market: "NSE:NIFTYBANK-INDEX",
    backtest: {
        from: "2021-01-01",
        to: "2021-01-31",
        timeframe: "5m",
        symbols: [],
    },
    riskManager: {
        enabled: true,
        stopLoss: 0.01,
        stopLossType: "percent",
        takeProfit: 0.01,
        takeProfitType: "percent",
        trailingStop: 0.01,
        trailingStopType: "percent",
        allowClosePosition: true,
        allowRejectOrder: true,
        allowModifyOrder: true,
        allowModifyPosition: true,
        allowModifyStopLoss: true,
        allowModifyTakeProfit: true,
        allowModifyTrailingStop: true,
    },
}
