export {}

declare global {
	interface iRateLimitData {
		[key: string]: {
			count: number
			lastRequest: Date
		}
	}

	//? ---------| enums start |------------
	enum _positionType {
		long = "long",
		scalping = "scalping",
		swing = "swing",
		expiry = "expiry",
	}
	enum _orderType {
		limitOrder = 1,
		marketOrder = 2,
		stopLoss = 3,
		stopLimit = 4,
	}
	enum _orderSide {
		buy = 1,
		sell = -1,
	}
	enum _productType {
		CNC = "CNC",
		INTRADAY = "INTRADAY",
		MARGIN = "MARGIN",
		CO = "CO",
		BO = "BO",
	}
	enum _orderStatus {
		cancelled = 1,
		traded = 2,
		futureUse = 3,
		transit = 4,
		rejected = 5,
		pending = 6,
	}
	enum _positionSide {
		long = 1,
		short = -1,
		closed = 0,
	}
	enum _orderSource {
		mobile = "M",
		web = "W",
		fyersOne = "R",
		admin = "A",
		API = "ITS",
	}

	//? -------------------| enums end |-------------------
	//   ----------------| Models interfaces | ----------------
	interface iLogger {
		message: string
		type: string
		by: string //[user, server]
		user: string //[null or userId]
		timestamp: Date
		loggedFrom: string
	}
	interface iSymbolTicks {
		symbolId: string
		symbol: string
		fySymbol: string
		originalName: string
		shortName: string
		description: string
		exchange: string
		highPrice: number
		lowPrice: number
		prevClosePrice: number
		ch: number
		tt: number
		cmd: {
			c: number
			h: number
			l: number
			o: number
			t: number
			v: number
			tf: string
		}

		chp: number
		openPrice: number
		lp: number
		LTQ: number
		L2LTT: number
		ATP: number
		volume: number
		totBuy: number
		totSell: number
		bid: number
		ask: number
		spread: number
		marketStat: number
	}
	interface iHistoricalData {
		symbol: string
		resolution: string
		t: number // timestamp
		o: number // candle open
		h: number // candle high
		l: number // candle low
		c: number // candle close
		v: number // candle volume
	}
	interface iOpenInterest {
		symbol: string
		timestamp: number
		strikePrice: number
		expiryDate: Date
		CE: {
			askPrice: number
			askQty: number
			bidPrice: number
			bidQty: number
			change: number
			changeInOpenInterest: number
			expiryDate: Date
			identifier: string
			impliedVolatility: number
			lastPrice: number
			openInterest: number
			pChange: number
			pChangeInOpenInterest: number
			strikePrice: number
			totalBuyQuantity: number
			totalSellQuantity: number
			totalTradedVolume: number
			underlyingValue: number
			underlying: string
		}
		PE: {
			askPrice: number
			askQty: number
			bidPrice: number
			bidQty: number
			change: number
			changeInOpenInterest: number
			expiryDate: Date
			identifier: string
			impliedVolatility: number
			lastPrice: number
			openInterest: number
			pChange: number
			pChangeInOpenInterest: number
			strikePrice: number
			totalBuyQuantity: number
			totalSellQuantity: number
			totalTradedVolume: number
			underlyingValue: number
			underlying: string
		}
	}
	interface iSession {
		session: string
		expires: number
		userId: string
	}
	interface iSettings {
		id: Number
		enableLogging: boolean
		keepRealTimeMarketsData: boolean
		activeStrategies: string[]
		developmentMode: boolean
		serverConf: {
			APIPort: number
			socketPort: number
			SMTP: {
				host: string
				port: number
				secure: boolean
				auth: {
					user: string
					pass: string
				}
			}
		}
		apis: {
			fyers: {
				appId: string
				secretId: string
				redirectUrl: string
				callbackSecret: string
				apiUrl: string
				webSocketUrl: string
				dataApiUrl: string
				status: boolean
				webhookSecret: string
			}
			kite: {
				apiKey: string
				apiSecret: string
				redirectUrl: string
				apiUrl: string
				webSocketUrl: string
				dataApiUrl: string
				status: boolean
			}
			trueData: {
				username: string
				password: string
				socketUrl: string
				replySocketUrl: string
				status: boolean
			}
			NSE: {
				OptionQuoteDerivativeAPIUrl: string
				OptionChainDataAPIUrl: string
				HolidaysAPIUrl: string
			}
		}
		global: {
			maxProfit: number
			maxLoss: number
			maxTradesPerDay: number
			enableMoneyManager: boolean
			orderPlacementSettings: {
				orderType: tOrderType
				productType: tProductType
			}
		}
		tasksLastRun: {
			[key: string]: any
		}
		lastUpdated: Date
	}

	interface iOrder {
		positionId: number
		orderDateTime: string
		orderId: string
		exchOrdId: string
		side: tOrderSide
		segment: number
		instrument: string
		productType: tProductType
		status: tOrderStatus
		quantity: number
		remainingQuantity: number
		filledQuantity: number
		limitPrice: number
		stopPrice: number
		orderType: tOrderType
		discloseQty: number
		dqQtyRem: number
		orderValidity: string
		source: tOrderSource
		slNo: number
		fyToken: string
		offlineOrder: boolean
		message: string
		orderNumStatus: string
		tradedPrice: number
		exchange: number
		pan: string
		clientId: string
		symbol: string
		ch: string
		chp: string
		lp: string
		ex_sym: string
		description: string
	}
	interface iPosition {
		id: number
		userId: string
		paper: boolean
		whichBroker: string
		side: tOrderSide
		symbol: string
		price: number
		quantity: number
		stopLoss: number
		peakLTP: number
		remainingQuantity: number
		filledQuantity: number
		buyAveragePrice: number
		sellAveragePrice: number
		trailingStopLoss: number
		riskToRewardRatio: number
		orderType: tOrderType
		productType: tProductType
		positionType: tPositionType
		realizedProfit: number
		unRealizedProfit: number
		madeBy: string
		strategyName: string
		orderStatus: tOrderStatus
		status: string
		message: string
		enteredAt: number
		exitedAt: number
		createdAt: number
		updatedAt: number
	}
	interface iTrade {
		id: string
		positionId: number
		userId: string
		exchange: string
		exchangeOrderNo: string
		orderDateTime: string
		orderNumber: string
		productType: tProductType
		segment: tOrderSegment
		side: tOrderSide
		symbol: string
		tradeNumber: string
		tradePrice: number
		tradeValue: number
		tradeQuantity: number
		createdAt?: number
		updatedAt?: number
	}
	interface iUser {
		_id: string
		email: string
		name: string
		displayName: string
		image: string
		pan: string
		status: Boolean
		roles: string[]
		connectedApps: string[]
		apps: string[]
		riskManager: {
			numberOfTradesAllowedPerDay: number
			takeControlOfManualTrades: boolean
			percentageOfMaxProfitPerDay: number
			percentageOfMaxLossPerDay: number
		}
		funds: {
			fyers: {
				available: number
				used: number
				total: number
			}
		}
		moneyManager: {
			fundsToUse: number
		}
		positionTypeSettings: {
			long: {
				quantity: number
				preferredOptionPrice: number | "ATM"
				riskToRewardRatio: number
				stopLoss: number
			}
			scalping: {
				quantity: number
				preferredOptionPrice: number | "ATM"
				riskToRewardRatio: number
				stopLoss: number
			}
			swing: {
				quantity: number
				preferredOptionPrice: number | "ATM"
				riskToRewardRatio: number
				stopLoss: number
			}
			expiry: {
				quantity: number
				preferredOptionPrice: number | "ATM"
				riskToRewardRatio: number
				stopLoss: number
			}
		}
		userAppsData: {
			fyers: {
				accessToken: string
				refreshToken: string
				Id: string
				loggedIn: boolean
				loggedInTime: Date
				lastUpdates: {
					orders: Date
					trades: Date
					positions: Date
					holdings: Date
					margins: Date
					profile: Date
					marketStatus: Date
					marketDepth: Date
					marketFeed: Date
				}
			}
		}
		lastLogin: Date
		loggedIn: boolean
	}

	interface iMarketData {
		id: string
		BANKNIFTY: {
			derivativeName: string
			expiryDates: string[]
			strikePrices: number[]
			lastUpdateTime: string
		}
		FINNIFTY: {
			derivativeName: string
			expiryDates: string[]
			strikePrices: number[]
			lastUpdateTime: string
		}
		NIFTY: {
			derivativeName: string
			expiryDates: string[]
			strikePrices: number[]
			lastUpdateTime: string
		}
		FnOHolidayList: [
			{
				holidayDate: string
				weekDay: string
				description: string
			},
		]
		lastUpdated: Number
	}

	interface iStrategies {
		id: string
		name: string
		description: string
		markets: string[]
		enabled: boolean
		backTest: {
			lastBackTested: Date
			backTestData: string
		}
		createdAt: Date
		updatedAt: Date
	}

	interface iKeepLTP {
		symbolTD: string
		symbolKite: string
		symbolFY: string
		ltp: number
		lastUpdated: Date
	}
	interface iSymbolData {
		trueDataSymbolId: string
		symbol: string
		fyersSymbol: string
		kiteSymbol: string
		trueDataSymbol: string
		ltp: number
		lastUpdated: Date
	}
	interface iMarketAlerts {
		id: string
		userId: string
		symbol: string
		condition: string
		value: number
		alerted: boolean
	}
	interface IOrderQueue {
		symbol: string
		quantity: number
		price: number
		stopPrice: number
		stopLoss: number
		takeProfit: number
		offlineOrder: boolean
		validity: "IOC" | "DAY"
		disclosedQuantity: number
		orderType: tOrderType
		orderSide: tOrderSide
		productType: tProductType
		status: tOrderStatus
	}
	//? --------- model interfaces end ------------
	//? --------- api interfaces start ------------
	interface iNewPositionDetails {
		symbol: string
		quantity: number
		limitPrice: number
		riskToReward: number
		positionType: tPositionType
		stopLoss: number
		orderSide: tOrderSide
		userId: string
	}
	//? ---------| api interfaces end |------------
	//? ---------| socket interfaces start |------------
	//? ---------| socket interfaces end |------------
	//? ---------| trade interfaces start |------------
	interface iNewOrder {
		symbol: string
		qty: number
		type: tOrderType // 1 - Limit Order, 2 - Market Order, 3 - Stop Loss (SL-M), 4 StopLimit (SL-L)
		side: tOrderSide
		productType: tProductType
		limitPrice: 0 | number
		stopPrice: 0 | number
		disclosedQty: 0 | number
		validity: "DAY" | "IOC"
		offlineOrder: boolean
		stopLoss: 0 | number
		takeProfit: 0 | number
	}
	//? ---------| trade interfaces end |------------

	//? ---------| general interfaces start |------------
	interface iAccessToken {
		accessToken: string
		email: string
	}

	//? ---------| general interfaces end |------------
	//? ---------- DataProcessingUnit interfaces start ------------
	interface iFyersSocketOrderUpdateData {
		userId: string
		orderId: string
		exchangeOrderId: string
		symbol: string
		quantity: number
		remainingQuantity: number
		filledQuantity: number
		status: tOrderStatus
		message: string
		segment: tOrderSegment
		limitPrice: number
		stopPrice: number
		productType: tProductType
		orderType: tOrderType
		orderSide: tOrderSide
		orderValidity: string
		orderDateTime: string
		parentId: string
		tradedPrice: number
		source: tOrderSource
		fyToken: string
		offlineOrder: boolean
		pan: string
		clientId: string
		exchange: string
		instrument: string
	}

	interface iFyersSocketTradeUpdateData {
		id: string
		userId: string
		symbol: string
		tradeId: number
		orderDateTime: string
		orderNumber: string
		tradeNumber: string
		tradePrice: number
		tradeValue: number
		tradeQuantity: number
		orderSide: tOrderSide
		productType: tProductType
		exchangeOrderNo: string
		segment: tOrderSegment
		exchange: string
		fyToken: string
	}

	interface iFyersSocketPositionUpdateData {
		userId: string
		symbol: string
		positionId: string
		buyAvg: number
		buyQty: number
		sellAvg: number
		sellQty: number
		netAvg: number
		netQty: number
		side: number
		qty: number
		productType: tProductType
		realizedProfit: number
		pl: number
		crossCurrency: string // Y or N
		rbiRefRate: number
		qtyMultiCom: number
		segment: tOrderSegment
		exchange: string
		slNo: number
		ltp: number
		fyToken: string
		cfBuyQty: number // Carry Forward Buy Quantity
		cfSellQty: number // Carry Forward Sell Quantity
		dayBuyQty: number // Day Buy Quantity
		daySellQty: number // Day Sell Quantity
	}
	interface iTrueDataMarketFeedsTouchlineData {
		symbol: string
		lastUpdateTime: string
		symbolId: string
		fySymbol: string
		lp: number
		tickVolume: number
		ATP: number
		totalVolume: number
		open: number
		high: number
		low: number
		previousClose: number
		turnOver: number
		bid: number
		bigQty: number
		ask: number
		askQty: number
	}
	interface iTrueDataMarketFeedsBidAskData {
		symbol: string
		time: string
		bid: string
		bidQty: string
		ask: string
		askQty: string
	}
	interface iTrueDataHandleBarData {
		symbol: string
		bar: string
		time: string
		open: string
		high: string
		low: string
		close: string
		volume: string
		oi: string
	}
	//? ----------| DataProcessingUnit interfaces end |------------

	//? ----------| fyers broker interfaces start |------------
	//   ----------------| Fyers Types | ----------------
	//! Not using these for now because fyers and kite both have different types for these
	//! will process data coming from fyers and kite and then convert them to our types
	type tPositionType = "long" | "scalping" | "swing" | "expiry" | "manual"
	type tOrderType = 1 | 2 | 3 | 4 // 1 - Limit Order, 2 - Market Order, 3 - Stop Loss (SL-M), 4 StopLimit (SL-L)
	type tOrderSide = 1 | -1 // 1 - Buy, -1 - Sell
	type tProductType = "CNC" | "INTRADAY" | "MARGIN" | "CO" | "BO"
	type tOrderStatus = 1 | 2 | 3 | 4 | 5 | 6 // 1 - Cancelled, 2 - Traded/Filled, 3 - For Future Use, 4 - Transit, 5 - Rejected, 6 - Pending
	type tOrderSource = "M" | "W" | "R" | "A" | "ITS" // M - Mobile, W - Web, R - Fyers One, A - Admin, ITS - API
	type tOrderSegment = 10 | 11 | 12 | 20 // 10 - E (Equity), 11 - D (F&O), 12 - C (Currency), 20 - M (Commodity)
	interface iSingleOrder {
		symbol: string
		qty: number
		type: tOrderType // 1 - Limit Order, 2 - Market Order, 3 - Stop Loss (SL-M), 4 StopLimit (SL-L)
		side: tOrderSide
		productType: tProductType
		limitPrice: 0 | number
		stopPrice: 0 | number
		disclosedQty: 0 | number
		validity: "DAY" | "IOC"
		offlineOrder: boolean
		stopLoss: 0 | number
		takeProfit: 0 | number
	}
	interface iCancelOrder {
		id: string
	}
}
