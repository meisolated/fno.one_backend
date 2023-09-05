import * as helper from "./helper"

/**
 *
 * Over here we have to make optimized version of FyersApi2 package
 * WHAT TO DO:
 * 1. Make a class FyersApi2
 * 2. How can we handle multiple instances of FyersApi2 with different tokens
 * 3. How can we handle multiple websocket connections with different tokens
 *
 *
 */
import axios from "axios"
import { getConfigData } from "../../config/initialize"
import logger from "../../logger"

const apiUrl = "https://api.fyers.in/api/v2/"
const orderUpdateSocket = helper.orderUpdateHelper
const marketDataSocket = helper.marketDataUpdateHelper

var rateLimitData: rateLimitData = {}

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
const getAuthToken = async (token: string) => {
	const config = getConfigData()
	return `${config.apis.fyers.appId}:${token}`
}
const generateLoginUrl = async () => {
	const config = getConfigData()
	const client_id = config.apis.fyers.appId
	const redirect_uri = config.apis.fyers.redirectUrl
	const state = config.apis.fyers.callbackSecret
	return `${apiUrl}generate-authcode?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`
}
const generateAccessToken = async (authCode: any) => {
	const config = getConfigData()
	const appId = config.apis.fyers.appId
	const secretId = config.apis.fyers.secretId
	const sha256 = await helper.sha256(`${appId}:${secretId}`)
	try {
		const accessToken = await axios.post(`${apiUrl}validate-authcode`, {
			grant_type: "authorization_code",
			code: authCode,
			appIdHash: sha256,
		})
		return accessToken.data
	} catch (error: any) {
		logger.error(error)
		return error
	}
}
const getProfile = async (token: string) => {
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
			const profile = await axios.get(`${apiUrl}profile`, reqConfig)
			return profile.data
		} catch (error: any) {
			logger.error(error)
			return error
		}
	}
}
const getFunds = async (token: string) => {
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
			const funds = await axios.get(`${apiUrl}funds`, reqConfig)
			return funds.data
		} catch (error: any) {
			logger.error(error)
			return error
		}
	}
}
const getHoldings = async (token: string) => {
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
			const holdings = await axios.get(`${apiUrl}holdings`, reqConfig)
			return holdings.data
		} catch (error: any) {
			logger.error(error)
			return error
		}
	}
}
const getTrades = async (token: string) => {
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
			const trades = await axios.get(`${apiUrl}tradebook`, reqConfig)
			return trades.data
		} catch (error: any) {
			logger.error(error)
			return error
		}
	}
}
const getPositions = async (token: string) => {
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
			const positions = await axios.get(`${apiUrl}positions`, reqConfig)
			return positions.data
		} catch (error: any) {
			logger.error(error)
			return error
		}
	}
}
const getOrders = async (token: string) => {
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
			const orders = await axios.get(`${apiUrl}orders`, reqConfig)
			return orders.data
		} catch (error: any) {
			logger.error(error)
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
const getHistoricalData = async (token: string, symbol: string, resolution: string, dateFormat: number, from: string, to: string) => {
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
			const historicalData = await axios.get(
				`https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${from}&range_to=${to}&cont_flag=`,
				reqConfig,
			)
			if (historicalData.data.s != "ok") {
				return false
			} else {
				return historicalData.data.candles
			}
		} catch (error: any) {
			logger.error(error)
			return false
		}
	}
}
export { generateAccessToken, generateLoginUrl, getFunds, getHistoricalData, getHoldings, getOrders, getPositions, getProfile, getTrades, marketDataSocket, orderUpdateSocket }
