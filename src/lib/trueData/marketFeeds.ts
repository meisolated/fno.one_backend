import {
	trueDataHandleBarDataProcessing,
	trueDataMarketFeedsHandleBidAskDataProcessing,
	trueDataMarketFeedsHandleTouchlineDataProcessing,
	trueDataMarketFeedsRealTimeDataProcessing,
} from "../../dataProcessingUnit"

import { EventEmitter } from "events"
import ws from "ws"
import { trueDataPingHandler } from "../../handler/ping.handler"
import logger from "../../logger"
import { SymbolData } from "../../model"
import { checkIfAllMarketDataTicksAreBeingProvidedByProvider } from "../../worker/verify"

const chatter = new EventEmitter()

/**
 * @description MarketFeeds class to connect to TrueData MarketFeeds Socket
 * @author username: meisolated on instagram and github
 * @date 23/06/2023
 * @class MarketFeeds
 * @constructor {username:string,password:string,symbols:string[],mode:string="live",autoConnect:boolean=true}
 */
class MarketFeeds {
	connection: ws | null = null
	private selfConnectionClosed = false
	private heartbeatStatus = false
	private heartbeatInterval = 20000
	private lastHeartBeatTime = Date.now()
	private logHeartbeat = false
	private totalSymbols = 0
	// auth params
	private auth = {
		username: "",
		password: "",
	}
	private allSymbols: string[] = []
	private userPort = 8082
	private websocketUrl = "wss://push.truedata.in"
	private replayWebsocketUrl = "wss://replay.truedata.in"
	private mode = "live"
	private reconnectInterval = 1000 * 10
	private _reconnectInterval: NodeJS.Timeout | null = null
	private _heartBeatCheckerInterval: NodeJS.Timeout | null = null

	// data
	private touchlineData: any = {}
	private touchlineMap: any = {}
	private bidAskData: any = {}

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

	async connect() {
		if (!this.connection) {
			logger.info("Connecting to TrueData...", "trueData[MarketFeeds]")
			let websocketUrl = this.mode === "live" ? this.websocketUrl : this.replayWebsocketUrl
			let url = `${websocketUrl}:${this.userPort}/?user=${this.auth.username}&password=${this.auth.password}`

			try {
				this.connection = new ws(url)
				this.connection.on("open", () => {
					logger.info("Connected to TrueData", "trueData[MarketFeeds]")
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
								logger.info("TrueData Real Time Data Service", "trueData[MarketFeeds]")
								this.heartbeatChecker()
								this.subscribe(this.allSymbols)
								break
							// -------------------------------------> symbol added <-------------------------------------
							case "symbols added":
								checkIfAllMarketDataTicksAreBeingProvidedByProvider([...this.allSymbols], [...jsonObj.symbollist])
								logger.info(`Added Symbols:${jsonObj.symbolsadded}, Total Symbols Subscribed:${jsonObj.totalsymbolsubscribed}`, "trueData[MarketFeeds]")
								jsonObj.symbollist.forEach((symbol: string[]) => {
									this.touchlineData[symbol[1]] = this.handleTouchline(symbol)
									this.touchlineMap[symbol[1]] = symbol[0]
								})
								chatter.emit("trueDataLibMarketDataUpdates-touchline", this.touchlineData)
								break
							// -------------------------------------> touchline <-------------------------------------
							case "touchline":
								logger.info("Touchline touched", "trueData[MarketFeeds]")
								jsonObj.symbollist.forEach((touchline: string[]) => {
									this.touchlineData[touchline[1]] = this.handleTouchline(touchline)
								})
								chatter.emit("trueDataLibMarketDataUpdates-touchline", this.touchlineData)
								break
							// -------------------------------------> HeartBeat <-------------------------------------
							case "HeartBeat":
								trueDataPingHandler(jsonObj)
								this.heartbeatStatus = true
								this.lastHeartBeatTime = Date.now()
								if (this.logHeartbeat) logger.info("HeartBeat", "trueData[MarketFeeds]")
								break
							// -------------------------------------> MarketStatus <-------------------------------------
							case "marketstatus":
								logger.info(`Market Status: ${jsonObj.data}`, "trueData[MarketFeeds]")
								break
							// -------------------------------------> Symbol Removed <-------------------------------------
							case "symbols removed":
								logger.info(`Removed Symbols:${jsonObj.symbolsremoved}, Symbols Subscribed:${jsonObj.totalsymbolsubscribed}`, "trueData[MarketFeeds]")
								break
							// -------------------------------------> Default <-------------------------------------
							default:
								logger.info(jsonObj.message, "trueData[MarketFeeds]")
						}
					} else if (jsonObj.success == false) {
						logger.error(jsonObj.message, "trueData[MarketFeeds]")
					}
				})

				this.connection.on("close", () => {
					logger.info("Connection closed", "trueData[MarketFeeds]")
					this.reconnectIntervalMethod()
				})

				this.connection.on("error", (err) => {
					logger.error(err.message, "trueData[MarketFeeds]")
				})
				// this.websocketEvents()
			} catch (err: any) {
				logger.error(err.message, "trueData[MarketFeeds]")
			}
		}
	}
	closeConnection() {
		if (this.connection) {
			logger.info("Closing connection", "trueData[MarketFeeds]")
			this.connection.close()
			this.connection = null
		} else {
			logger.error("Why are you trying to close something not open", "trueData[MarketFeeds]")
			return {
				status: "error",
				message: "Connection not established",
			}
		}
	}

	unSubscribe(symbols: string[]) {
		logger.info(`Unsubscribing Symbols: ${symbols}`, "trueData[MarketFeeds]")
		for (let i = 0; i <= symbols.length; i += 1500) {
			const jsonRequest = {
				method: "removesymbol",
				symbols: symbols.slice(i, i + 1500),
			}
			let s = JSON.stringify(jsonRequest)
			this.connection?.send(s)
		}
	}

	async subscribe(symbols: string[]) {
		// this.touchlineMap = {}
		const symbolDataFromDB: any = await SymbolData.find({ symbol: { $in: symbols } })

		symbolDataFromDB.forEach((symbol: any) => {
			this.touchlineMap[symbol.trueDataSymbolId] = symbol.symbol
			return
		})
		logger.info(`Subscribing Symbols: ${symbols}`, "trueData[MarketFeeds]")
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
		logger.info("Heartbeat Checker Initiated", "trueData[MarketFeeds]")
		if (!this.logHeartbeat) logger.warn("Heartbeat logging disabled by default or disabled by you!", "trueData[MarketFeeds]")
		this._heartBeatCheckerInterval = setInterval(() => {
			const checkerHeartBeat = Date.now() - this.lastHeartBeatTime
			if (checkerHeartBeat > 15000) {
				this.closeConnection()
				this.heartbeatStatus = false
				logger.info(`Auto Reconnect Initiated @ ${new Date().toLocaleTimeString()}`, "trueData[MarketFeeds]")
				clearInterval(this._heartBeatCheckerInterval as NodeJS.Timeout)
			}
		}, 20000)
	}

	private reconnectIntervalMethod() {
		logger.info("Reconnect interval to TrueData started", "trueData[MarketFeeds]")
		if (this._reconnectInterval) clearInterval(this._reconnectInterval)
		this._reconnectInterval = setInterval(() => {
			logger.info("Reconnecting to TrueData...", "trueData[MarketFeeds]")
			this.closeConnection()
			this.connect()
		}, this.reconnectInterval)
	}

	// ------------- data handlers ----------------
	private handleTouchline(touchline: string[]) {
		const data = {
			Symbol: touchline[0],
			Symbol_ID: +touchline[1],
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
		return true
	}

	private handleRealTimeData(tradeArray: string[]) {
		// console.log(tradeArray, this.touchlineMap)
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
		trueDataMarketFeedsRealTimeDataProcessing(data)
		return
	}

	private handleBidAskData(bidaskArray: string[]) {
		const data = {
			Symbol: this.touchlineMap[bidaskArray[0]],
			SymbolId: bidaskArray[0],
			Time: bidaskArray[1],
			Bid: +bidaskArray[2],
			BidQty: +bidaskArray[3],
			Ask: +bidaskArray[4],
			AskQty: +bidaskArray[5],
		}
		trueDataMarketFeedsHandleBidAskDataProcessing(data)
		return
	}

	private handleBarData(barArray: string[], bar: string) {
		const data = {
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
		trueDataHandleBarDataProcessing(data)
		return
	}
}

export default MarketFeeds
