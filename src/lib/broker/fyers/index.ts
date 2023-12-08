import axios from "axios"
import { getConfigData } from "../../../config/initialize"
import logger from "../../../logger"
import * as helper from "./helper"
import * as url from "./urlTemplate"

var rateLimitData: iRateLimitData = {}

const rateLimit = (token: string) => {
	const currentTime = new Date().getTime()
	if (rateLimitData[token]) {
		if (rateLimitData[token].lastRequest.getTime() + 1000 > currentTime) {
			if (rateLimitData[token].count >= 10) {
				return false
			} else {
				rateLimitData[token].count++
				return true
			}
		} else if (rateLimitData[token].lastRequest.getTime() + 60000 > currentTime) {
			if (rateLimitData[token].count >= 200) {
				return false
			} else {
				rateLimitData[token].count++
				return true
			}
		} else if (rateLimitData[token].lastRequest.getTime() + 3600000 > currentTime) {
			if (rateLimitData[token].count >= 10000) {
				return false
			} else {
				rateLimitData[token].count++
				return true
			}
		} else {
			rateLimitData[token].count = 1
			rateLimitData[token].lastRequest = new Date()
			return true
		}
	} else {
		rateLimitData[token] = {
			count: 1,
			lastRequest: new Date(),
		}
		return true
	}
}
export const getAuthToken = async (token: string) => {
	const config = getConfigData()
	return `${config.apis.fyers.appId}:${token}`
}
export const generateLoginUrl = async () => {
	const config = getConfigData()
	const client_id = config.apis.fyers.appId
	const redirect_uri = config.apis.fyers.redirectUrl
	const state = config.apis.fyers.callbackSecret
	return url.authenticationUrl(client_id, redirect_uri, state)
	// return`${apiUrl}generate-authcode?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`
}
export const generateAccessToken = async (authCode: any) => {
	const config = getConfigData()
	const appId = config.apis.fyers.appId
	const secretId = config.apis.fyers.secretId
	const sha256 = helper.getSHA256Hash(`${appId}:${secretId}`)
	try {
		const accessToken = await axios.post(url.validateAuthCodeUrl(), {
			grant_type: "authorization_code",
			code: authCode,
			appIdHash: sha256,
		})
		return accessToken.data
	} catch (error: any) {
		logger.error(error, "fyers/index.ts[generateAccessToken]")
		return error
	}
}
export const getProfile = async (token: string) => {
	const rateLimitCheck = rateLimit(token)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(token)
		const reqConfig = {
			method: "GET",
			headers: {
				Authorization: AuthorizationToken,
			},
		}
		try {
			const profile = await axios.get(url.getProfileUrl(), reqConfig)
			return profile.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[getProfile]")
			return error
		}
	}
}
export const getFunds = async (token: string) => {
	const rateLimitCheck = rateLimit(token)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(token)
		const reqConfig = {
			method: "GET",
			headers: {
				Authorization: AuthorizationToken,
			},
		}
		try {
			const funds = await axios.get(url.getFundsUrl(), reqConfig)
			return funds.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[getFunds]")
			return error
		}
	}
}
export const getHoldings = async (token: string) => {
	const rateLimitCheck = rateLimit(token)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(token)
		const reqConfig = {
			method: "GET",
			headers: {
				Authorization: AuthorizationToken,
			},
		}
		try {
			const holdings = await axios.get(url.getHoldingsUrl(), reqConfig)
			return holdings.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[getHoldings]")
			return error
		}
	}
}
export const getTrades = async (token: string) => {
	const rateLimitCheck = rateLimit(token)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(token)
		const reqConfig = {
			method: "GET",
			headers: {
				Authorization: AuthorizationToken,
			},
		}
		try {
			const trades = await axios.get(url.getTradesUrl(), reqConfig)
			return trades.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[getTrades]")
			return error
		}
	}
}
export const getPositions = async (token: string) => {
	const rateLimitCheck = rateLimit(token)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(token)
		const reqConfig = {
			method: "GET",
			headers: {
				Authorization: AuthorizationToken,
			},
		}
		try {
			const positions = await axios.get(url.getPositionsUrl(), reqConfig)
			return positions.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[getPositions]")
			return error
		}
	}
}
export const getOrders = async (token: string) => {
	const rateLimitCheck = rateLimit(token)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(token)
		const reqConfig = {
			method: "GET",
			headers: {
				Authorization: AuthorizationToken,
			},
		}
		try {
			const orders = await axios.get(url.getOrdersUrl(), reqConfig)
			return orders.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[getOrders]")
			return error
		}
	}
}
/**
 *
 * @param token
 * @param symbol symbol name eg: NSE:SBIN-EQ
 * @param resolution time frame eg: 1, 2, 3, 5, 10, 15, 20, 30, 60, 120, 240
 * @param dateFormat 0 for epoch value and 1 for yyyy-mm-dd format
 * @param from time
 * @param to time
 */
export const getHistoricalData = async (token: string, symbol: string, resolution: string, dateFormat: number, from: string, to: string) => {
	const rateLimitCheck = rateLimit(token)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(token)
		const reqConfig = {
			method: "GET",
			headers: {
				Authorization: AuthorizationToken,
			},
		}
		try {
			const historicalData = await axios.get(url.getHistoricalDataUrl(symbol, resolution, dateFormat, from, to, 0), reqConfig)
			if (historicalData.data.s != "ok") {
				return false
			} else {
				return historicalData.data.candles
			}
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[getHistoricalData]")
			return false
		}
	}
}

/**
 * Place Single Order
 * @param accessToken user fyers accessToken
 * @param data new Order Data
 * @returns
 */
export const placeSingleOrder = async (accessToken: string, data: iNewOrder) => {
	const rateLimitCheck = rateLimit(accessToken)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(accessToken)
		const reqConfig = {
			"url": url.placeSingleOrderUrl(),
			"method": "post",
			"maxBodyLength": Infinity,
			"Content-Type": "application/json",
			"headers": {
				Authorization: AuthorizationToken,
			},
			"data": JSON.stringify(data),
		}
		console.log("reqConfig", reqConfig)
		try {
			const orderPlacementResponse = await axios.request(reqConfig)
			return orderPlacementResponse.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[placeSingleOrder]")
			return error.response.data
		}
	}
}

/**
 * Place Single Order
 * @param accessToken user fyers accessToken
 * @param data new Order Data
 * @returns
 */
export const placeMultiOrder = async (accessToken: string, data: iNewOrder[]) => {
	const rateLimitCheck = rateLimit(accessToken)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(accessToken)
		const reqConfig = {
			"url": url.placeMultiOrderUrl(),
			"method": "post",
			"maxBodyLength": Infinity,
			"Content-Type": "application/json",
			"headers": {
				Authorization: AuthorizationToken,
			},
			"data": JSON.stringify(data),
		}
		try {
			const orderPlacementResponse = await axios.request(reqConfig)
			return orderPlacementResponse.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[placeMultiOrder]")
			return error.response.data
		}
	}
}

/**
 *
 * @param accessToken user fyers accessToken
 * @param data list of iCancelOrder
 * @returns
 */
export const cancelSingleOrder = async (accessToken: string, data: iCancelOrder) => {
	const rateLimitCheck = rateLimit(accessToken)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(accessToken)
		const reqConfig = {
			"url": url.cancelOrderUrl(),
			"method": "post",
			"maxBodyLength": Infinity,
			"Content-Type": "application/json",
			"headers": {
				Authorization: AuthorizationToken,
			},
			"data": JSON.stringify(data),
		}
		try {
			const orderCancellationResponse = await axios.request(reqConfig)
			return orderCancellationResponse.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[cancelOrder]")
			return error.response.data
		}
	}
}

/**
 *
 * @param accessToken user fyers accessToken
 * @param data list of iCancelOrder
 * @returns
 */
export const cancelMultiOrder = async (accessToken: string, data: iCancelOrder[]) => {
	const rateLimitCheck = rateLimit(accessToken)
	if (!rateLimitCheck) {
		return {
			status: "error",
			message: "Rate limit exceeded",
		}
	} else {
		const AuthorizationToken = await getAuthToken(accessToken)
		const reqConfig = {
			"url": url.cancelMultiOrderUrl(),
			"method": "post",
			"maxBodyLength": Infinity,
			"Content-Type": "application/json",
			"headers": {
				Authorization: AuthorizationToken,
			},
			"data": JSON.stringify(data),
		}
		try {
			const orderCancellationResponse = await axios.request(reqConfig)
			return orderCancellationResponse.data
		} catch (error: any) {
			logger.error(error, "fyers/index.ts[cancelOrder]")
			return error.response.data
		}
	}
}
