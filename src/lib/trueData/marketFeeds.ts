import { EventEmitter } from "events"
import ws from "ws"
import { trueDataMarketFeedsHandleTouchlineDataProcessing, trueDataMarketFeedsRealTimeDataProcessing } from "../../dataProcessingUnit"
import logger from "../../logger"
const chatter = new EventEmitter()

/**
 * @description MarketFeeds class to connect to TrueData
 * @author username: meisolated on instagram and github
 * @date 23/06/2023
 * @class MarketFeeds
 * @constructor {username:string,password:string,symbols:string[],mode:string="live",autoConnect:boolean=true}
 */
class MarketFeeds {
	connection: ws | null = null
	selfConnectionClosed = false
	heartbeatStatus = false
	heartbeatInterval = 20000
	lastHeartBeatTime = Date.now()
	logHeartbeat = false
	totalSymbols = 0
	// auth params
	auth = {
		username: "",
		password: "",
	}
	allSymbols: string[] = []
	userPort = 8082
	websocketUrl = "wss://push.truedata.in"
	replayWebsocketUrl = "wss://replay.truedata.in"
	mode = "live"
	reconnectInterval = 1000 * 10
	_reconnectInterval: NodeJS.Timeout | null = null
	_heartBeatCheckerInterval: NodeJS.Timeout | null = null

	// data
	touchlineData: any = {}
	touchlineMap: any = {}
	bidAskData: any = {}

	constructor(username: string, password: string, symbols: string[], mode: string = "live", autoConnect: boolean = true, logHeartbeat: boolean = false) {
		this.auth.username = username
		this.auth.password = password
		this.allSymbols = symbols
		this.totalSymbols = symbols.length
		this.mode = mode
		this.logHeartbeat = logHeartbeat
		if (autoConnect) {
			this.connect()
		}
	}

	connect() {
		if (!this.connection) {
			logger.info("Connecting to TrueData...", false, undefined, "TrueData")
			let websocketUrl = this.mode === "live" ? this.websocketUrl : this.replayWebsocketUrl
			let url = `${websocketUrl}:${this.userPort}/?user=${this.auth.username}&password=${this.auth.password}`

			try {
				this.connection = new ws(url)
				this.connection.on("open", () => {
					logger.info("Connected to TrueData", false, undefined, "TrueData")
				})

				this.connection.on("message", (data) => {
					if (this._reconnectInterval) {
						clearInterval(this._reconnectInterval)
						this._reconnectInterval = null
					}
					var jsonObj = JSON.parse(data.toString())
					if (jsonObj.trade != null) {
						const tradeArray = jsonObj.trade
						chatter.emit("trueDataLibMarketDataUpdates-tick", this.handleRealTimeData(tradeArray))
					} else if (this.bidAskData && jsonObj.bidask != null) {
						const bidAskArray = jsonObj.bidask
						chatter.emit("trueDataLibMarketDataUpdates-bigAsk", this.handleBidAskData(bidAskArray))
					} else if (jsonObj.success) {
						switch (jsonObj.message) {
							case "TrueData Real Time Data Service":
								logger.info("TrueData Real Time Data Service", false, undefined, "TrueData")
								this.heartbeatChecker()
								this.subscribe(this.allSymbols)
								break
							// -------------------> symbol added <-------------------
							case "symbols added":
								logger.info(`Added Symbols:${jsonObj.symbolsadded}, Total Symbols Subscribed:${jsonObj.totalsymbolsubscribed}`, false, undefined, "TrueData")
								jsonObj.symbollist.forEach((symbol: string[]) => {
									this.touchlineData[symbol[1]] = this.handleTouchline(symbol)
									this.touchlineMap[symbol[1]] = symbol[0]
								})
								chatter.emit("trueDataLibMarketDataUpdates-touchline", this.touchlineData)
								break
							// -------------------> touchline <-------------------
							case "touchline":
								logger.info("Touchline touched", false, undefined, "TrueData")
								jsonObj.symbollist.forEach((touchline: string[]) => {
									this.touchlineData[touchline[1]] = this.handleTouchline(touchline)
								})
								chatter.emit("trueDataLibMarketDataUpdates-touchline", this.touchlineData)
								break
							// -------------------> HeartBeat <-------------------
							case "HeartBeat":
								this.heartbeatStatus = true
								this.lastHeartBeatTime = Date.now()
								if (this.logHeartbeat) logger.info("HeartBeat", false, undefined, "TrueData")
								break
							case "marketstatus":
								logger.info(`Market Status: ${jsonObj.data}`, false, undefined, "TrueData")
								break
							case "symbols removed":
								logger.info(`Removed Symbols:${jsonObj.symbolsremoved}, Symbols Subscribed:${jsonObj.totalsymbolsubscribed}`, false, undefined, "TrueData")
								break
							default:
								logger.info(jsonObj.message, false, undefined, "TrueData")
						}
					} else if (jsonObj.success == false) {
						console.log(jsonObj)
						logger.error(jsonObj.message, false, undefined, "TrueData")
					}
				})

				this.connection.on("close", () => {
					logger.info("Connection closed", false, undefined, "TrueData")
					this.reconnectIntervalMethod()
				})

				this.connection.on("error", (err) => {
					logger.error(err.message, false, undefined, "TrueData")
				})
				// this.websocketEvents()
			} catch (err: any) {
				logger.error(err.message, false, undefined, "TrueData")
			}
		}
	}

	dataCallback(callback: any) {
		chatter.on("trueDataLibMarketDataUpdates-tick", (data) => {
			callback(data)
		})
		chatter.on("trueDataLibMarketDataUpdates-touchline", (data) => {
			// callback(data)
		})
		chatter.on("trueDataLibMarketDataUpdates-bigAsk", (data) => {
			// callback(data)
		})
	}

	closeConnection() {
		if (this.connection) {
			logger.info("Closing connection", false, undefined, "TrueData")
			this.connection.close()
			this.connection = null
		} else {
			logger.error("Why are you trying to close something not open", false, undefined, "TrueData")
			return {
				status: "error",
				message: "Connection not established",
			}
		}
	}

	unSubscribe(symbols: string[]) {
		logger.info(`Unsubscribing Symbols: ${symbols}`, false, undefined, "TrueData")
		for (let i = 0; i <= symbols.length; i += 1500) {
			const jsonRequest = {
				method: "removesymbol",
				symbols: symbols.slice(i, i + 1500),
			}
			let s = JSON.stringify(jsonRequest)
			this.connection?.send(s)
		}
	}

	subscribe(symbols: string[]) {
		logger.info(`Subscribing Symbols: ${symbols}`, false, undefined, "TrueData")
		//for-loop to override max 65000 characters
		for (let i = 0; i <= symbols.length; i += 1500) {
			const jsonRequest = {
				method: "addsymbol",
				symbols: symbols.slice(i, i + 1500),
			}
			let s = JSON.stringify(jsonRequest)
			this.connection?.send(s)
		}
	}

	private heartbeatChecker() {
		logger.info("Heartbeat Checker Initiated", false, undefined, "TrueData")
		if (!this.logHeartbeat) logger.warn("Heartbeat logging disabled by default or disabled by you!", false, undefined, "TrueData")
		this._heartBeatCheckerInterval = setInterval(() => {
			const checkerHeartBeat = Date.now() - this.lastHeartBeatTime
			if (checkerHeartBeat > 15000) {
				this.closeConnection()
				this.heartbeatStatus = false
				logger.info(`Auto Reconnect Initiated @ ${new Date().toLocaleTimeString()}`, false, undefined, "TrueData")
				clearInterval(this._heartBeatCheckerInterval as NodeJS.Timeout)
			}
		}, 20000)
	}

	private reconnectIntervalMethod() {
		logger.info("Reconnect interval to TrueData started", false, undefined, "TrueData")
		if (this._reconnectInterval) clearInterval(this._reconnectInterval)
		this._reconnectInterval = setInterval(() => {
			logger.info("Reconnecting to TrueData...", false, undefined, "TrueData")
			this.closeConnection()
			this.connect()
		}, this.reconnectInterval)
	}

	// ------------- data handlers ----------------
	private handleTouchline(touchline: string[]) {
		const data = {
			Symbol: touchline[0],
			LastUpdateTime: touchline[2],
			LTP: +touchline[3],
			TickVolume: +touchline[4],
			ATP: +touchline[5],
			TotalVolume: +touchline[6],
			Open: +touchline[7],
			High: +touchline[8],
			Low: +touchline[9],
			Previous_Close: +touchline[10],
			Today_OI: +touchline[11],
			Previous_Open_Interest_Close: +touchline[12],
			Turnover: +touchline[13],
			Bid: +touchline[14] || 0,
			BidQty: +touchline[15] || 0,
			Ask: +touchline[16] || 0,
			AskQty: +touchline[17] || 0,
		}
		trueDataMarketFeedsHandleTouchlineDataProcessing(data)
		return data
	}

	private handleRealTimeData(tradeArray: string[]) {
		const data = {
			Symbol: this.touchlineMap[tradeArray[0]],
			Symbol_ID: +tradeArray[0],
			Timestamp: tradeArray[1],
			LTP: +tradeArray[2],
			LTQ: +tradeArray[3],
			ATP: +tradeArray[4],
			Volume: +tradeArray[5],
			Open: +tradeArray[6],
			High: +tradeArray[7],
			Low: +tradeArray[8],
			Prev_Close: +tradeArray[9],
			OI: +tradeArray[10],
			Prev_Open_Int_Close: +tradeArray[11],
			Day_Turnover: +tradeArray[12],
			Special: tradeArray[13],
			Tick_Sequence_No: +tradeArray[14],
			Bid: +tradeArray[15] || 0,
			Bid_Qty: +tradeArray[16] || 0,
			Ask: +tradeArray[17] || 0,
			Ask_Qty: +tradeArray[18] || 0,
		}
		const processedData = trueDataMarketFeedsRealTimeDataProcessing(data)
		return processedData
	}

	private handleBidAskData(bidaskArray: string[]) {
		return {
			Symbol: this.touchlineMap[bidaskArray[0]],
			SymbolId: bidaskArray[0],
			Time: bidaskArray[1],
			Bid: +bidaskArray[2],
			BidQty: +bidaskArray[3],
			Ask: +bidaskArray[4],
			AskQty: +bidaskArray[5],
		}
	}

	private handleBarData(barArray: string[], bar: string) {
		return {
			Symbol: this.touchlineMap[barArray[0]],
			SymbolId: barArray[0],
			Bar: bar,
			Time: barArray[1],
			Open: +barArray[2],
			High: +barArray[3],
			Low: +barArray[4],
			Close: +barArray[5],
			Volume: +barArray[6],
			OI: +barArray[7],
		}
	}
}

export default MarketFeeds
