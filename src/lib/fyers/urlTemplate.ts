import crypto from "crypto"
import { getConfigData } from "../../config/initialize"

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

/**
 * @param clientId
 * @param redirectUrl fyers authentication url
 * @param state some random string
 * @returns
 */
export const authenticationUrl = (clientId: string, redirectUrl: string, state: string) =>
	`${SyncAPI + generateAuthPath}?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&state=${state}`

/**
 * @description This is the url to validate the auth code
 * @raw-data ``` {grant_type: "authorization_code", appIdHash: string, code:sting (authCode)} ```
 * @returns
 */
export const validateAuthCodeUrl = () => `${SyncAPI + validateAuthCodePath}}`

/**
 * @description This is the url to validate the refresh token
 * @raw-data ```{grant_type: "refresh_token", appIdHash: string, refresh_token:sting (refreshToken), pin: string (User pin)}```
 *
 * When we validate the auth code to generate the access token, a refresh token is also sent in the response.
 * The refresh token has a validity of 15 days. A new access token can be generated using the refresh token as long as the refresh token is valid.
 * The following parameters must be passed in the body for the POST request
 */
export const validateRefreshTokenUrl = () => `${API + validateRefreshTokenPath}}`

/**
 * # Get Profile
 * @description This is the url to get the profile details of the user
 * @Authorization:appId:accessToken
 * @returns data : name, display_name, fy_id, image, email_id, pan, pin_change_date, pwd_change_date, mobile_number, totp, pwd_to_expire
 */
export const getProfileUrl = () => `${SyncAPI + getProfilePath}`

/**
 * # Get Funds
 * @description This is the url to get the funds details of the user
 * @Authorization:appId:accessToken
 * @returns fund_limit : [{id, title, equityAmount, commodityAmount}]
 *
 */
export const getFundsUrl = () => `${SyncAPI + fundsPath}`

/**
 * # Get Holding
 * @description This is the url to get the holdings details of the user
 * @Authorization:appId:accessToken
 * @returns holdings: [{id, holdingType, quantity, costPrice, marketVal, remainingQuantity, pl, ltp, fyToken, exchange, symbol, segment, isin, qty_t1, remainingPledgeQuantity, collateralQuantity}]
 * @returns overall : { count_total, total_investment, total_current_value, total_pl, pnl_perc}
 */
export const getHoldingsUrl = () => `${SyncAPI + holdingsPath}`

/**
 * # Get Order
 * @description This is the url to get the order details of the user
 * @Authorization:appId:accessToken
 * @returns orderBook : {clientId, id, exchOrdId, qty, remainingQuantity, filledQty, disclosedQty, limitPrice, stopPrice, stopPrice, tradedPrice, type, fyToken, exchange, segment, symbol, instrument, message, offlineOrder, orderDateTime, orderValidity, pan, productType, side, status, source, ex_sym, description, ch, chp, lp, slNo, dqQtyRem, orderNumStatus, disclosedQty }
 */
export const getOrdersUrl = () => `${SyncAPI + ordersPath}`

export const getOrderByOrderIdUrl = (orderId: string) => `${SyncAPI + ordersPath}?id=${orderId}`
