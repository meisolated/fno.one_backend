//@ts-nocheck
import axios from "axios"
import history from "./dataApi/history"
import quotes from "./dataApi/quotes"
import errorHandler from "./errorHandler/errorHandler"
import helper from "./helper/helper"
import token from "./token/tokenGeneration"

import marketDepth from "./dataApi/marketDepth"
const aPI = helper.accessPoint()

class clientApi {
    setAppId(value) {
        token.setAppId(value)
    }

    setRedirectUrl(url) {
        token.setRedirectUrl(url)
    }
    setAccessToken(value) {
        token.setToken(value)
    }

    generateAuthToken(req) {
        if (req) {
            return `${req.app_id}:${req.token}`
        } else {
            return token.getAuthToken()
        }
    }
    /* V2 Api integration */
    generateAuthCode = async (req?) => {
        const client_id = (req && req.client_id) || token.getAppId()
        const redirect_uri = (req && req.redirect_uri) || token.getRedirectUrl()
        const state = (req && req.state) || "sample_state"
        console.log(`${aPI}generate-authcode?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`)
    }

    generate_access_token = async (req) => {
        //    console.log(sha256)

        const code_verifier = req.code_verifier || ""
        const auth_code = req.auth_code || ""
        const client_id = req.client_id || token.getAppId()
        const secret_key = req.secret_key || ""
        const sha256 = await helper.sha256(`${client_id}:${secret_key}`)

        try {
            if (code_verifier === "") {
                const access_token = await axios.post(`${aPI}validate-authcode`, {
                    grant_type: "authorization_code",
                    code: req.auth_code,
                    appIdHash: sha256,
                })
                console.log(access_token)
                return access_token.data
            } else {
                const access_token = await axios.post(`${aPI}validate-authcode`, {
                    grant_type: "authorization_code",
                    code_verifier: req.code_verifier,
                    code: req.auth_code,
                })
                return access_token.data
            }
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    get_profile = async (req?) => {
        let AuthorizationToken = this.generateAuthToken(req)

        try {
            const profile = await axios.get(`${aPI}profile`, {
                headers: {
                    Authorization: AuthorizationToken,
                },
            })
            return profile.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    get_funds = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const funds = await axios.get(`${aPI}funds`, {
                headers: {
                    Authorization: authorization,
                },
            })
            return funds.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }
    get_holdings = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const holdings = await axios.get(`${aPI}holdings`, {
                headers: {
                    Authorization: authorization,
                },
            })
            return holdings.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    place_order = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const place_orders = await axios.post(`${aPI}orders`, req.data, {
                headers: {
                    Authorization: authorization,
                },
            })
            return place_orders.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }
    place_multi_order = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const place_multi_orders = await axios.post(`${aPI}orders-multi`, req.data, {
                headers: {
                    Authorization: authorization,
                },
            })
            return place_multi_orders.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }
    get_orders = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const orders = await axios.get(`${aPI}orders`, {
                headers: {
                    Authorization: authorization,
                },
            })
            return orders.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    get_filtered_orders = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const filterOrder = await axios.get(`${aPI}orders?id=${req.order_id}`, {
                headers: {
                    Authorization: authorization,
                },
            })
            return filterOrder.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    get_positions = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const positions = await axios.get(`${aPI}positions`, {
                headers: {
                    Authorization: authorization,
                },
            })
            return positions.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    get_tradebook = async (req?) => {
        let authorization = this.generateAuthToken(req)
        try {
            const tradebook = await axios.get(`${aPI}tradebook`, {
                headers: {
                    Authorization: authorization,
                },
            })
            return tradebook.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    modify_order = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const modify = await axios.put(`${aPI}orders`, req.data, {
                headers: {
                    Authorization: authorization,
                },
            })
            return modify.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    modify_multi_order = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const modify_multi_order = await axios.put(`${aPI}orders-multi`, req.data, {
                headers: {
                    Authorization: authorization,
                },
            })
            return modify_multi_order.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    cancel_order = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const cancelOrder = await axios.delete(`${aPI}orders`, {
                headers: {
                    Authorization: authorization,
                },
                data: req.data,
            })
            return cancelOrder.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    cancel_multi_order = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const cancelMultiOrder = await axios.delete(`${aPI}orders-multi`, {
                headers: {
                    Authorization: authorization,
                },
                data: req.data,
            })
            return cancelMultiOrder.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    exit_position = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const exitPosition = await axios.delete(`${aPI}positions `, {
                headers: {
                    Authorization: authorization,
                },
                data: req.data,
            })
            return exitPosition.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    convert_position = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const convert_position = await axios.put(`${aPI}positions`, req.data, {
                headers: {
                    Authorization: authorization,
                },
            })
            return convert_position.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    market_status = async (req) => {
        let authorization = this.generateAuthToken(req)
        try {
            const marketStatus = await axios.get(`${aPI}market-status`, {
                headers: {
                    Authorization: authorization,
                },
            })
            return marketStatus.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    fyers_connect = async (req, callback4) => {
        helper.FyersConnect(req.token, req.symbol, req.dataType, callback4)
    }

    fyers_unsubscribe = async (req?) => {
        helper.FyersConnect(req.token, req.symbol, req.dataType, null, true)
    }
    history = history
    quotes = quotes
    marketDepth = marketDepth
    /* v2 api integration ends here */
}

export default new clientApi()
