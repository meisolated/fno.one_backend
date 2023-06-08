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
import config from "../../config"
import logger from "../../logger"
import * as helper from "./helper"
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
    return `${config.fyers.appId}:${token}`
}
const generateLoginUrl = async () => {
    const client_id = config.fyers.appId
    const redirect_uri = config.fyers.redirectUrl
    const state = config.fyers.callbackSecret
    return `${config.fyers.apiUrl}generate-authcode?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`
}
const generateAccessToken = async (authCode: any) => {
    const appId = config.fyers.appId
    const secretId = config.fyers.secretId
    const sha256 = await helper.sha256(`${appId}:${secretId}`)
    try {
        const accessToken = await axios.post(`${config.fyers.apiUrl}validate-authcode`, {
            grant_type: "authorization_code",
            code: authCode,
            appIdHash: sha256,
        })
        return accessToken.data
    } catch (error: any) {
        logger.error(error, false)
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
            const profile = await axios.get(`${config.fyers.apiUrl}profile`, reqConfig)
            return profile.data
        } catch (error: any) {
            logger.error(error, false)
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
            const funds = await axios.get(`${config.fyers.apiUrl}funds`, reqConfig)
            return funds.data
        } catch (error: any) {
            logger.error(error, false)
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
            const holdings = await axios.get(`${config.fyers.apiUrl}holdings`, reqConfig)
            return holdings.data
        } catch (error: any) {
            logger.error(error, false)
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
            const trades = await axios.get(`${config.fyers.apiUrl}tradebook`, reqConfig)
            return trades.data
        } catch (error: any) {
            logger.error(error, false)
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
            const positions = await axios.get(`${config.fyers.apiUrl}positions`, reqConfig)
            return positions.data
        } catch (error: any) {
            logger.error(error, false)
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
            const orders = await axios.get(`${config.fyers.apiUrl}orders`, reqConfig)
            return orders.data
        } catch (error: any) {
            logger.error(error, false)
            return error
        }
    }
}
export { generateLoginUrl, generateAccessToken, getProfile, getFunds, getHoldings, getTrades, getPositions, getOrders, orderUpdateSocket, marketDataSocket }
