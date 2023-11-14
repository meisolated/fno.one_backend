export {}

declare global {
	interface rateLimitData {
		[key: string]: {
			count: number
			lastRequest: Date
		}
	}

	//   ----------------| Types | ----------------
	//! Not using these for now because fyers and kite both have different types for these
	//! will process data coming from fyers and kite and then convert them to our types
	// type positionType = "long" | "scalping" | "swing" | "expiry"
	// type orderType = 1 | 2 | 3 | 4 // 1 - Limit Order, 2 - Market Order, 3 - Stop Loss (SL-M), 4 StopLimit (SL-L)
	// type orderSide = 1 | -1 // 1 - Buy, -1 - Sell
	// type productType = "CNC" | "INTRADAY" | "MARGIN" | "CO" | "BO"
	// type orderStatus = 1 | 2 | 3 | 4 | 5 | 6 // 1 - Cancelled, 2 - Traded/Filled, 3 - For Future Use, 4 - Transit, 5 - Rejected, 6 - Pending
	// type positionSide = 1 | -1 | 0 // 1 - Long, -1 - Short, 0 - Closed Position
	// type orderSource = "M" | "W" | "R" | "A" | "ITS" // M - Mobile, W - Web, R - Fyers One, A - Admin, ITS - API

	//   ----------------| Models interfaces | ----------------
	interface logger {
		message: string
		type: string
		by: string //[user, server]
		user: string //[null or userId]
		date: Date
		loggedFrom: string
	}
	interface symbolTicks {
		symbolId: string
		symbol: string
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
	interface historicalData {
		symbol: string
		resolution: string
		t: number // timestamp
		o: number // candle open
		h: number // candle high
		l: number // candle low
		c: number // candle close
		v: number // candle volume
	}
	interface openInterest {
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
	interface session {
		session: string
		expires: number
		userId: string
	}
	interface settings {
		id: Number
		state: string
		simulateTicks: boolean
		enableLogging: boolean
		realTimeMarketsToWatch: string[]
		keepRealTimeMarketsData: boolean
		activeStrategies: string[]
		primaryFyersAccountEmail: string
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
		}
		tasksLastRun: {
			[key: string]: any
		}
		lastUpdated: Date
	}

	interface order {
		id: string
		orderDateTime: string
		orderId: string
		exchOrdId: string
		side: number
		segment: number
		instrument: string
		productType: string
		status: number
		qty: number
		remainingQuantity: number
		filledQty: number
		limitPrice: number
		stopPrice: number
		type: number
		discloseQty: number
		dqQtyRem: number
		orderValidity: string
		source: string
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
	interface positions {
		id: string
		paper: boolean
		whichBroker: string
		buyAvgPrice: number
		buyQty: number
		sellAvgPrice: number
		sellQty: number
		netAvgPrice: number
		netQty: number
		side: number
		qty: number
		productType: string
	}
	interface trades {
		id: string
		paper: boolean
		clientId: string
		exchange: string
		exchangeOrderNo: string
		fyToken: string
		orderDateTime: string
		orderNumber: string
		orderType: number
		productType: string
		row: number
		segment: string
		side: number
		symbol: string
		tradeNumber: string
		tradePrice: number
		tradeValue: number
		tradedQty: number
		madeBy: string
		strategyName: string
		createdAt: Date
		updatedAt: Date
	}
	interface tradeManager {
		tradeId: string
		userId: string
		symbol: string
		side: number
		riskToRewardRatio: number
		quantity: number
		buyPrice: number
		sellPrice: number
		stopLoss: number
		positionType: string
		enteredAt: number
		exitedAt: number
		status: string
		message: string
		createdAt: Date
		updatedAt: Date
	}
	interface user {
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
		}
		funds: {
			fyers: {
				available: number
				used: number
				total: number
			}
		}
		moneyManager: {
			percentageOfFundsToUse: number
			fundsToUse: number
			maxLossPerDay: number // in percentage and this percentage is going to get calculated from money manager funds to use -> weekday funds to use (PERCENTAGE OF THIS AMOUNT)
			weekDays: {
				monday: {
					percentageOfFundsToUse: number
					fundsToUse: number
				}
				tuesday: {
					percentageOfFundsToUse: number
					fundsToUse: number
				}
				wednesday: {
					percentageOfFundsToUse: number
					fundsToUse: number
				}
				thursday: {
					percentageOfFundsToUse: number
					fundsToUse: number
				}
				friday: {
					percentageOfFundsToUse: number
					fundsToUse: number
				}
			}
		}
		positionTypeSettings: {
			long: {
				percentageOfFundsToUse: number
				preferredOptionPrice: number | "ATM"
				riskToRewardRatio: number
				stopLoss: number
			}
			scalping: {
				percentageOfFundsToUse: number
				preferredOptionPrice: number | "ATM"
				riskToRewardRatio: number
				stopLoss: number
			}
			swing: {
				percentageOfFundsToUse: number
				preferredOptionPrice: number | "ATM"
				riskToRewardRatio: number
				stopLoss: number
			}
			expiry: {
				percentageOfFundsToUse: number
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

	interface marketData {
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

	interface strategies {
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

	interface keepLTP {
		symbolTD: string
		symbolKite: string
		symbolFY: string
		ltp: number
		lastUpdated: Date
	}
	interface symbolData {
		trueDataSymbolId: string
		symbol: string
		fyersSymbol: string
		kiteSymbol: string
		trueDataSymbol: string
		ltp: number
		lastUpdated: Date
	}
	interface marketAlerts {
		id: string
		userId: string
		symbol: string
		condition: string
		value: number
		alerted: boolean
	}
	// --------- model interfaces end ------------

	// --------- socket interfaces start ------------
	// --------- socket interfaces end ------------
	// --------- fyers interfaces start ------------
	interface newOrder {
		symbol: string
		qty: number
		type: number // 1 - Limit Order, 2 - Market Order, 3 - Stop Loss (SL-M), 4 StopLimit (SL-L)
		side: 1 | -1
		productType: "CND" | "INTRADAY" | "MARGIN" | "CO" | "BO"
		limitPrice: 0 | number
		stopPrice: 0 | number
		disclosedQty: 0 | number
		validity: "DAY" | "IOC"
		offlineOrder: boolean
		stopLoss: 0 | number
		takeProfit: 0 | number
	}
	// --------- fyers interfaces end ------------

	// general interfaces
	interface AccessToken {
		accessToken: string
		email: string
	}

	interface trueDataMarketFeedsTouchlineData {
		symbol: string
		lastUpdateTime: string
		symbolId: string
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
	interface trueDataMarketFeedsBidAskData {
		symbol: string
		time: string
		bid: string
		bidQty: string
		ask: string
		askQty: string
	}
	interface trueDataHandleBarData {
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
}
