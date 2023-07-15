export {}

declare global {
	interface rateLimitData {
		[key: string]: {
			count: number
			lastRequest: Date
		}
	}

	// Models interfaces
	interface logger {
		message: string
		type: string
		by: string //[user, server]
		user: string //[null or userId]
		date: Date
		loggedFrom: string
	}
	interface symbolTicks {
		symbol: string
		original_name: string
		short_name: string
		description: string
		exchange: string
		high_price: number
		low_price: number
		prev_close_price: number
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
		open_price: number
		lp: number
		LTQ: number
		L2_LTT: number
		ATP: number
		volume: number
		tot_buy: number
		tot_sell: number
		bid: number
		ask: number
		spread: number
		marketStat: number
	}
	interface marketHistory {
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
		realTimeMarketsToWatch: string[]
		keepRealTimeMarketsData: boolean
		activeStrategies: string[]
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

		lastUpdated: Date
	}
	interface trades {
		id: string
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
	interface user {
		email: string
		name: string
		displayName: string
		image: string
		pan: string
		status: string
		roles: string[]
		settings: {
			stopLoss: number
			takeProfit: number
			activeStrategies: string[]
			dailyTrades: number
		}
		connectedApps: string[]
		apps: string[]
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

	// general interfaces
	interface AccessToken {
		accessToken: string
		email: string
	}
}
