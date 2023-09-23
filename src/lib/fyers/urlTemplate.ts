import crypto from "crypto"

//  urls
export const API = "https://api.fyers.in/api/v2"
export const SyncAPI = "https://api-t1.fyers.in/api/v3"
export const dataApi = "https://api.fyers.in/data-rest/v2"
export const dataApi1 = "https://api-t1.fyers.in/data"
export const HSMSocket = "wss://socket.fyers.in/hsm/v1-5/prod"
export const OrderSocket = "wss://socket.fyers.in/trade/v3"
//  paths
const getProfilePath = "/profile"
const tradeBookPath = "/tradebook"
const positionsPath = "/positions"
const holdingsPath = "/holdings"
const convertPositionPath = "/positions"
const gttPath = "/gtt"
const fundsPath = "/funds"
const ordersPath = "/orders"
const ordersSyncPath = "/orders/sync"
const orderStatusPath = "/order-status"
const marketStatusPath = "/marketStatus"
const generateAuthPath = "/generate-authcode"
const validateAuthCodePath = "/validate-authcode"
const validateRefreshTokenPath = "/validate-refresh-token"
const exitPositionsPath = "/positions"
const multiOrdersPath = "/multi-order/sync"
const historyPath = "/history"
const quotesPath = "/quotes"
const marketDepthPath = "/depth"
const spanMarginPath = "/span_margin"

/**
 * 
 * @param clientId
 * @param redirectUrl fyers authentication url
 * @param state some random string
 * @returns
 * 
 */
export const authenticationUrl = (clientId: string, redirectUrl: string, state: string) =>
	`${SyncAPI + generateAuthPath}?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&state=${state}`

/**
 * 
 * @description This is the url to validate the auth code
 * @raw-data ``` {grant_type: "authorization_code", appIdHash: string, code:sting (authCode)} ```
 * @returns
 * 
 */
export const validateAuthCodeUrl = () => `${SyncAPI + validateAuthCodePath}`

/**
 * 
 * @description This is the url to validate the refresh token
 * @raw-data ```{grant_type: "refresh_token", appIdHash: string, refresh_token:sting (refreshToken), pin: string (User pin)}```
 *
 * When we validate the auth code to generate the access token, a refresh token is also sent in the response.
 * The refresh token has a validity of 15 days. A new access token can be generated using the refresh token as long as the refresh token is valid.
 * The following parameters must be passed in the body for the POST request
 * 
 */
export const validateRefreshTokenUrl = () => `${API + validateRefreshTokenPath}`

/**
 * 
 * # Get Profile
 * @description This is the url to get the profile details of the user
 * @Authorization : appId:accessToken
 * @returns data : name, display_name, fy_id, image, email_id, pan, pin_change_date, pwd_change_date, mobile_number, totp, pwd_to_expire
 * 
 */
export const getProfileUrl = () => `${SyncAPI + getProfilePath}`

/**
 * 
 * # Get Funds
 * @description This is the url to get the funds details of the user
 * @Authorization : appId:accessToken
 * @returns fund_limit : [{id, title, equityAmount, commodityAmount}]
 *
 */
export const getFundsUrl = () => `${SyncAPI + fundsPath}`

/**
 * 
 * # Get Holding
 * @description This is the url to get the holdings details of the user
 * @Authorization : appId:accessToken
 * @returns holdings: [{id, holdingType, quantity, costPrice, marketVal, remainingQuantity, pl, ltp, fyToken, exchange, symbol, segment, isin, qty_t1, remainingPledgeQuantity, collateralQuantity}]
 * @returns overall : { count_total, total_investment, total_current_value, total_pl, pnl_perc}
 * 
 */
export const getHoldingsUrl = () => `${SyncAPI + holdingsPath}`

/**
 * 
 * # Get Order
 * @description This is the url to get the order details of the user
 * @Authorization : appId:accessToken
 * @returns orderBook : [{clientId, id, exchOrdId, qty, remainingQuantity, filledQty, disclosedQty, limitPrice, stopPrice, stopPrice, tradedPrice, type, fyToken, exchange, segment, symbol, instrument, message, offlineOrder, orderDateTime, orderValidity, pan, productType, side, status, source, ex_sym, description, ch, chp, lp, slNo, dqQtyRem, orderNumStatus, disclosedQty }]
 * 
 */
export const getOrdersUrl = () => `${SyncAPI + ordersPath}`

/**
 * 
 * # Get Order by OrderId
 * @description This is the url to get the order by orderId
 * @Authorization : appId:accessToken
 * @param orderId 
 * @returns orderBook: [{ clientId, id, exchOrdId, qty, remainingQuantity, filledQty, disclosedQty, limitPrice, stopPrice, stopPrice, tradedPrice, type, fyToken, exchange, segment, symbol, instrument, message, offlineOrder, orderDateTime, orderValidity, pan, productType, side, status, source, ex_sym, description, ch, chp, lp, slNo, dqQtyRem, orderNumStatus, disclosedQty }}]
 * 
 */
export const getOrderByOrderIdUrl = (orderId: string) => `${SyncAPI + ordersPath}?id=${orderId}`

/**
 * 
 * # Get User positions (current open and closed)
 * @description This is the url to get the positions of the user 
 * @Authorization : appId:accessToken
 * @returns netPositions : [{ symbol, id, buyAvg, buyQty, sellAvg, sellQty, netAvg, netQty, side, qty, productType, realized_profit, unrealized_profit, pl, crossCurrency, rbiRefRate, qtyMulti_com, segment, exchange, slNo, ltp, fytoken, cfBuyQty, cfSellQty, dayBuyQty, daySellQty}]
 * @returns overall : { count_total, count_open, pl_total, pl_realized, pl_unrealized }
 * 
 */
export const getPositionsUrl = () => `${SyncAPI + positionsPath}`

/**
 * 
 * # Get User trades for the current day 
 * @GET
 * @description This is the url to get the trades of the user
 * @Authorization : appId:accessToken
 * @returns tradeBook : [{ symbol, id, orderDateTime, orderNumber, tradeNumber, tradePrice, tradeValue, tradedQty, side, productType, exchangeOrderNo, segment, exchange, fyToken}]
 * 
 */
export const getTradesUrl = () => `${SyncAPI + tradeBookPath}`

/**
 * 
 * # Place Order 
 * @POST
 * @description This is the url to place the order
 * @Authorization : appId:accessToken
 * @raw-data : ```{symbol, qty, side, type, productType, limitPrice, stopPrice, disclosedQty, validity, offlineOrder, stopLoss, squareOff, trailingStopLoss, variety, exchange, symbol, instrument, fyToken, segment, isin, offlineOrder}```
 * @return : { s, code, message, id }
 * 
 */
export const placeSingleOrderUrl = () => `${SyncAPI + ordersSyncPath}`

/**
 * 
 * # Place Multi Order
 * @POST
 * @description This is the url to place the multi order
 * @Authorization : appId:accessToken
 * @raw-data : `` [{symbol, qty, side, type, productType, limitPrice, stopPrice, disclosedQty, validity, offlineOrder, stopLoss, squareOff, trailingStopLoss, variety, exchange, symbol, instrument, fyToken, segment, isin, offlineOrder}]
 * @return : { s, code, data:[{statusCode, body:{s, code, message, id}, statusDescription}] }
 * 
 */
export const placeMultiOrderUrl = () => `${SyncAPI + multiOrdersPath}`

/**
 * 
 * # Modify Order
 * @PATCH
 * @description This is the url to modify the order
 * @Authorization : appId:accessToken
 * @raw-data : ```{id*, type*, limitPrice, stopPrice, qty}```
 * @return : { s, code, message, id }
 * 
 */
export const modifyOrderUrl = () => `${SyncAPI + ordersSyncPath}`


/**
 * 
 * # Modify Multi Order
 * @PATCH
 * @description This is the url to modify the multi order
 * @Authorization : appId:accessToken
 * @raw-data : `` [{id*, type*, limitPrice, stopPrice, qty}]
 * @return : { s, code, data:[{statusCode, body:{s, code, message, id}, statusDescription}] }
 * 
 */
export const modifyMultiOrderUrl = () => `${SyncAPI + multiOrdersPath}`

/**
 * 
 * # Cancel Order
 * @DELETE
 * @description This is the url to cancel the order
 * @Authorization : appId:accessToken
 * @raw-data : ```{id*}```
 * @return : { s, code, message, id }
 * 
 */
export const cancelOrderUrl = () => `${SyncAPI + ordersSyncPath}`

/**
 * 
 * # Cancel Multi Order
 * @DELETE
 * @description This is the url to cancel the multi order
 * @Authorization : appId:accessToken
 * @raw-data : `` [{id*}]
 * @return : { s, code, data:[{statusCode, body:{s, code, message, id}, statusDescription}] }
 * 
 */
export const cancelMultiOrderUrl = () => `${SyncAPI + multiOrdersPath}`

/**
 * 
 * # Exit Position
 * @DELETE
 * @description This is the url to exit the position
 * @Authorization : appId:accessToken
 * @raw-data : { id:[ ] } | { id } | { exit_all : 1 }  If id is not passed, all the positions will be exited
 * @return : { s, code, message }
 * 
 */
export const exitPositionUrl = () => `${SyncAPI + exitPositionsPath}`

/**
 * 
 * # Exit Position by Symbol
 * @DELETE
 * @description This is the url to exit the position by symbol
 * @Authorization : appId:accessToken
 * @raw-data : {"id":"NSE:SBIN-EQ-BO"}
 * 
 */
export const exitPositionBySymbolUrl = () => `${SyncAPI + exitPositionsPath}`

/**
 * 
 * # Exit Position by Segment and ProductType
 * @DELETE	
 * @description This is the url to exit the position by segment
 * @Authorization : appId:accessToken
 * @raw-data : {segment*, side*, productType*}
 * 
 */
export const exitPositionBySegmentAndProductTypeUrl = () => `${SyncAPI + exitPositionsPath}`

/**
 * 
 * # Cancel Pending Order
 * @DELETE
 * @description This is the url to cancel the pending order
 * @Authorization : appId:accessToken
 * @raw-data : { pending_orders_cancel : 1 } | { id : "NSE:SBIN-EQ-BO", pending_orders_cancel : 1 }
 * 
 */
export const cancelPendingOrderUrl = () => `${SyncAPI + exitPositionsPath}`

/**
 * 
 * # Convert Position
 * @POST
 * @description This is the url to convert the position
 * @Authorization : appId:accessToken
 * @raw-data : { symbol, overnigth, positionSide, convertQty, convertFrom, convertTo }
 * @return : { s, code, message }
 * 
 */
export const convertPositionUrl = () => `${SyncAPI + convertPositionPath}`

/**
 * 
 * # Calculate Span Margin
 * @POST
 * @description This is the url to calculate the span margin
 * @Authorization : appId:accessToken
 * @raw-data : { symbol, qty, side, type, productType, limitPrice, stopLoss }
 * @return : @notProvidedInFyersDocs
 * 
 */
export const marginCalculatorUrl = () => `${SyncAPI + spanMarginPath}`


/**
 * 
 * # Get market status '
 * @GET
 * @description This is the url to get the market status
 * @Authorization : appId:accessToken
 * @return : { code, marketStatus: [{ exchange, market_Type, segment, status}], message, s}
 *
 */
export const getMarketStatus = () => `${SyncAPI + marketStatusPath}`

/**
 * 
 * # Get Historical Data
 * @GET
 * @description This is the url to get the historical data
 * @Authorization : appId:accessToken
 * @param symbol string
 * @param resolution 1, 2, 3, 5, 10, 15, 20, 30, 60, 120, 240, 1D
 * @param dateFormat 0 for epoch and 1 for YYYY-MM-DD format
 * @param from 
 * @param to
 * @param contFlag set cont flag 1 for continues data and future options.
 * @return : { s, candles: [{tt, o, h, l, c, v}]}
 * 
 */
export const getHistoricalDataUrl = (symbol: string, resolution: string, dateFormat: number, from: string, to: string, contFlag: number) => `${dataApi + historyPath}?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${from}&range_to=${to}&cont_flag=${contFlag}`

/**
 * 
 * # Get Market Quote
 * @GET
 * @description This is the url to get the market quote
 * @Authorization : appId:accessToken
 * @param symbol string
 * @return : {s, ch, chp, lp, spread, ask, bid, open_price, high_price, low_price, prev_close_price, volume, short_name, exchange, description, original_name, symbol, fyToken, tt, cmd }
 * 
 */
export const getQuotesUrl = (symbol: string) => `${dataApi + quotesPath}?symbol=${symbol}`

/**
 * 
 * # Get Market Depth
 * @GET
 * @description This is the url to get the market depth
 * @Authorization : appId:accessToken
 * @param symbol string
 * @param ohlcv_flag Set the ohlcv_flag to 1 to get open, high, low, closing and volume quantity'
 * @return : {s, code, totalbuyqty, totalsellqty, bids, ask, o, h, i, c, chp, tick_Size, ch, ltq, ltt, ltp, v, atp, lower_ckt, upper_ckt, expiry, oi, oiflag, pdoi, oipercent }
 *
 */
export const getMarketDepthUrl = (symbol: string, ohlcv_flag: number) => `${dataApi + marketDepthPath}?symbol=${symbol}&ohlcv_flag=${ohlcv_flag}`


export const exchanges: any = {
	10: "NSE (National Stock Exchange)",
	11: "MCX (Multi Commodity Exchange)",
	12: "BSE (Bombay Stock Exchange)"
}
export const segments: any = {
	10: "Capital Market",
	11: "Equity Derivatives",
	12: "Currency Derivatives",
	13: "Commodity Derivatives",
}

export const instrumentTypes: any = {
	0: "EQ (Equity)",
	1: "PREFSHARES (Preference Shares)",
	2: "DEBENTURES (Debentures)",
	3: "WARRANTS (Warrants)",
	4: "MISC (Miscellaneous)",
	10: "INDEX (Index)",
	11: "FUTIDX (Futures Index)",
	12: "FUTIVX (Futures Volatility Index)",
	13: "FUTSTK (Futures Stock)",
	14: "OPTIDX (Options Index)",
	15: "OPTSTK (Options Stock)",
	16: "FUTCUR (Futures Currency)",
	17: "FUTIRT (Futures Interest Rate)",
	18: "FUTIRC (Futures Interest Rate Cap)",
	19: "OPTCUR (Options Currency)",
	20: "UNDCUR (Underlying Currency)",
	21: "UNDIRC (Underlying Interest Rate Cap)",
	22: "UNDIRT (Underlying Interest Rate)",
	23: "UNDIRD (Underlying Interest Rate Floor)",
	24: "INDEX_CD (Index CD)",
	25: "FUTIRD (Futures Interest Rate Floor)",
	30: "FUTCOM (Futures Commodity)",
	31: "OPTFUT (Options Futures)",
	32: "OPTCOM (Options Commodity)",
}

export const productTypes: any = {
	"CNC": "for equity only",
	"INTRADAY": "Applicable for all segments",
	"MARGIN": "Applicable for all derivatives",
	"CO": "Cover order",
	"BO": "Bracket order",
}
export const orderTypes: any = {
	1: "Limit Order",
	2: "Market Order",
	3: "Stop Order (SL-M)",
	4: "Stop Limit Order (SL-L)",
}
export const orderStatus: any = {
	1: "Cancelled",
	2: "Traded/Filled",
	3: "For future use",
	4: "Transit",
	5: "Rejected",
	6: "Pending",
}
export const orderSide: any = {
	1: "Buy",
	"-1": "Sell",
}
export const positionSide: any = {
	1: "Long",
	"-1": "Short",
	0: "Closed Position"
}

export const orderSource = {
	"M": "Mobile",
	"W": "Web",
	"R": "Fyers One",
	"A": "Admin",
	"ITS": "API"
}