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
import logger from "../logger"
import * as helper from "./helper"
const orderUpdateSocket = helper.orderUpdateHelper

const getConfig = async () => {
    const config = await import("../config/index.json")
    return config
}
const getAuthToken = async (token: string) => {
    const config = await getConfig()
    return `${config.fyers.appId}:${token}`
}
const generateLoginUrl = async (req: any) => {
    const config = await getConfig()
    const client_id = config.fyers.appId
    const redirect_uri = config.fyers.redirectUrl
    const state = "sample_state"
    return `${config.fyers.apiUrl}generate-authcode?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`
}
const generateAccessToken = async (authCode: any) => {
    const config = await getConfig()
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
        logger.info(error, false)
        return error
    }
}
const getProfile = async (token: string) => {
    const config = await getConfig()
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
        logger.info(error, false)
        return error
    }
}
const getFunds = async (token: string) => {
    const config = await getConfig()
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
        logger.info(error, false)
        return error
    }
}
const getHoldings = async (token: string) => {
    const config = await getConfig()
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
        logger.info(error, false)
        return error
    }
}
export { generateLoginUrl, generateAccessToken, getProfile, getFunds, getHoldings, orderUpdateSocket }

