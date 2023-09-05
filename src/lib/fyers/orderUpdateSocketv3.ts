import ws from "ws"
import {
	fyersSocketOrderUpdateDataProcessing,
	fyersSocketPositionsUpdateDataProcessing,
	fyersSocketTradeUpdateDataProcessing,
	fyersSocketUnknownDataProcessing,
} from "../../dataProcessingUnit/fyersAPI.dpu"
import logger from "../../logger"

const orderSocketUrl = "wss://socket.fyers.in/trade/v3"
const ordStatObj: any = {
	11: 4,
	12: 4,
	20: 4,
	21: 4,
	22: 6,
	23: 6,
	24: 6,
	25: 6,
	26: 6,
	90: 2,
	91: 1,
	92: 5,
	93: 5,
	94: 5,
	51: 6,
	52: 6,
	53: 6,
	54: 6,
	55: 6,
	61: 6,
	62: 6,
	63: 6,
	64: 6,
	71: 6,
	72: 6,
	73: 1,
}
const ordersMapper = {
	client_id: "clientId",
	id: "id",
	id_parent: "parentId",
	id_exchange: "exchOrdId",
	qty: "qty",
	qty_remaining: "remainingQuantity",
	qty_filled: "filledQty",
	price_limit: "limitPrice",
	price_stop: "stopPrice",
	tradedPrice: "price_traded",
	ord_type: "type",
	fy_token: "fyToken",
	exchange: "exchange",
	segment: "segment",
	symbol: "symbol",
	instrument: "instrument",
	oms_msg: "message",
	offline_flag: "offlineOrder",
	time_oms: "orderDateTime",
	validity: "orderValidity",
	product_type: "productType",
	tran_side: "side",
	ord_status: "status",
	ord_source: "source",
	symbol_exch: "ex_sym",
	symbol_desc: "description",
}
const positionBookMapper = {
	symbol: "symbol",
	id: "id",
	buy_avg: "buyAvg",
	buy_qty: "buyQty",
	buy_val: "buyVal",
	sell_avg: "sellAvg",
	sell_qty: "sellQty",
	sell_val: "sellVal",
	net_avg: "netAvg",
	net_qty: "netQty",
	tran_side: "side",
	qty: "qty",
	product_type: "productType",
	pl_realized: "realized_profit",
	rbirefrate: "rbiRefRate",
	fy_token: "fyToken",
	exchange: "exchange",
	segment: "segment",
	day_buy_qty: "dayBuyQty",
	day_sell_qty: "daySellQty",
	cf_buy_qty: "cfBuyQty",
	cf_sell_qty: "cfSellQty",
	qty_multiplier: "qtyMulti_com",
	pl_total: "pl",
	cross_curr_flag: "crossCurrency",
	pl_unrealized: "unrealized_profit",
}
const tradeBookMapper = {
	id_fill: "tradeNumber",
	id: "orderNumber",
	qty_traded: "tradedQty",
	price_traded: "tradePrice",
	traded_val: "tradeValue",
	product_type: "productType",
	client_id: "clientId",
	id_exchange: "exchangeOrderNo",
	ord_type: "orderType",
	tran_side: "side",
	symbol: "symbol",
	fill_time: "orderDateTime",
	fy_token: "fyToken",
	exchange: "exchange",
	segment: "segment",
}

const mapper = { orders: ordersMapper, position: positionBookMapper, tradebook: tradeBookMapper }

function dataMapper(a: any, b: any) {
	const result: any = {}
	for (const key of Object.keys(b)) {
		if (a.hasOwnProperty(key)) {
			result[b[key]] = a[key]
		}
	}
	return result
}

export default class FyersOrderSocket {
	private url: string
	private connection: ws | null = null
	private authorizationKey: string = ""
	private reconnectTries = 0
	private reconnectInterval: any = null
	private reconnectIntervalTime = 5000
	private maxReconnectionTries = 10
	private pingInterval: any = null
	private isPingEnabled = true
	private subscribeTo = ["orders", "trades", "positions", "edis", "pricealerts"]

	constructor(authorizationKey: string, autoConnect: boolean = true, isPingEnabled: boolean) {
		this.url = orderSocketUrl
		this.authorizationKey = authorizationKey
		this.isPingEnabled = isPingEnabled
		if (autoConnect) {
			this.connect()
		}
	}

	connect() {
		try {
			this.connection = new ws(this.url, {
				headers: {
					Authorization: this.authorizationKey,
				},
			})
			this.connection.binaryType = "arraybuffer"
			// WS Events
			this.connection.on("error", (error) => {
				this.autoReConnect()
				logger.error(`Fyers Order Socket Error: ${error}`, "FyersOrderSocket")
			})
			this.connection.on("open", () => {
				this.reconnectTries = 0
				if (this.reconnectInterval) clearInterval(this.reconnectInterval)
				if (this.isPingEnabled) this.startPing()
				this.subUnSub(true, this.subscribeTo)
				logger.info("Fyers Order Socket Connected", "FyersOrderSocket")
			})
			this.connection.on("close", () => {
				this.autoReConnect()
				logger.info("Fyers Order Socket Closed", "FyersOrderSocket")
			})
			this.connection.on("message", (_data: any) => {
				try {
					const data: any = _data.toString()
					if (data === "pong") return
					const parsedData = JSON.parse(data)
					if (parsedData.hasOwnProperty("orders")) {
						let orderData = dataMapper(parsedData.orders, mapper.orders)
						orderData.status = ordStatObj[orderData.status]
						orderData.orderNumStatus = `${orderData.id}:${orderData.status}`
						fyersSocketOrderUpdateDataProcessing(orderData)
					} else if (parsedData.hasOwnProperty("positions")) {
						let positionData = dataMapper(parsedData.positions, mapper.position)
						fyersSocketPositionsUpdateDataProcessing(positionData)
					} else if (parsedData.hasOwnProperty("trades")) {
						let tradeData = dataMapper(parsedData.trades, mapper.tradebook)
						fyersSocketTradeUpdateDataProcessing(tradeData)
					} else {
						fyersSocketUnknownDataProcessing(parsedData)
					}
				} catch (error) {
					console.log(_data.toString())
					logger.error(`Fyers Order Socket Error: ${error}`, "FyersOrderSocket")
				}
			})
		} catch (error) {
			this.autoReConnect()
			logger.error(`Fyers Order Socket Error: ${error}`, "FyersOrderSocket")
		}
	}

	private subUnSub(subscribe: boolean, what: Array<string>) {
		const action = subscribe ? 1 : -1
		try {
			if (this.isConnected()) {
				this.connection?.send(JSON.stringify({ T: "SUB_ORD", SLIST: what, SUB_T: action }))
			} else {
				logger.error("Fyers Order Socket is not connected", "FyersOrderSocket")
			}
		} catch (error) {
			logger.error(`Fyers Order Socket Error: ${error}`, "FyersOrderSocket")
		}
	}
	private startPing() {
		this.pingInterval = setInterval(() => {
			if (this.isConnected()) {
				this.connection?.send("ping")
			}
		}, 1000)
	}
	private stopPing() {
		if (this.pingInterval) clearInterval(this.pingInterval)
	}
	private isConnected() {
		return this.connection?.readyState === ws.OPEN
	}
	private autoReConnect() {
		if (this.reconnectInterval) clearInterval(this.reconnectInterval)
		if (!this.isConnected() && this.reconnectTries < this.maxReconnectionTries) {
			this.reconnectInterval = setInterval(() => {
				this.connect()
				this.reconnectTries++
			}, this.reconnectIntervalTime)
		} else {
			const reason = this.reconnectTries >= this.maxReconnectionTries ? "Max Reconnection Tries" : "Already Connected"
			logger.error(`ReConnect attempt failed because ${reason} `, "FyersOrderSocket")
		}
	}
}
