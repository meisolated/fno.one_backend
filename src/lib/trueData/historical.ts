import axios from "axios"
import { getConfigData } from "../../config/initialize"
import qs from "qs"

class HistoricalData {
	private _username: string
	private _password: string
	private _accessToken: string = ""
	public _accessTokenGenerated: boolean = false
	private _apiUrl = "https://history.truedata.in/"
	private _expireTime: number = 0
	constructor() {
		this._username = getConfigData().apis.trueData.username
		this._password = getConfigData().apis.trueData.password
	}
	public async getAccessToken() {
		let data = qs.stringify({
			username: this._username,
			password: this._password,
			grant_type: "password",
		})
		let config = {
			method: "post",
			maxBodyLength: Infinity,
			url: "https://auth.truedata.in/token",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: data,
		}
		await axios
			.request(config)
			.then((response) => {
				if (response.data.access_token != undefined) {
					this._accessToken = response.data.access_token
					this._expireTime = Math.floor(Date.now() / 1000) + response.data.expires_in
					return (this._accessTokenGenerated = true)
				}
				return (this._accessTokenGenerated = false)
			})
			.catch((error) => {
				return (this._accessTokenGenerated = false)
			})
	}
	private async checkAccessToken() {
		if (this._expireTime < Math.floor(Date.now() / 1000)) {
			await this.getAccessToken()
		}
	}
	/**
	 *
	 * @param symbol Market Symbol
	 * @param n Number of bars
	 * @param interval Interval of bars [1min, 5min, 10min, 15min, 30min, 60min, 1day, 1week, 1month]
	 * @param bidask 0 for OHLCV, 1 for Bid, 2 for Ask
	 * @returns [timestamp,open,high,low,close,volume,oi]
	 */
	public async getLastNBars(symbol: string, n: number, interval: string = "1min", bidask: number = 0) {
		await this.checkAccessToken()
		let config = {
			method: "get",
			maxBodyLength: Infinity,
			url: this._apiUrl + `getlastnbars?symbol=${symbol}&response=json&nbars=${n}&interval=${interval}&bidask=${bidask}`,
			headers: {
				Authorization: "Bearer " + this._accessToken,
			},
		}
		const response = await axios.request(config)
		if (response.data.status == "Success") {
			return response.data
		} else {
			return false
		}
	}

	checkDurationInDays(from: string, to: string) {
		// from and to FORMAT: YYMMDDT:HH:MM:SS
		let fromDate = new Date(from)
		let toDate = new Date(to)
		let diff = Math.abs(toDate.getTime() - fromDate.getTime())
		let diffDays = Math.ceil(diff / (1000 * 3600 * 24))
		return diffDays
	}
	public async getBarData(symbol: string, interval: string = "1min", from: string, to: string) {
		if (this.checkDurationInDays(from, to) > 30) return false
		await this.checkAccessToken()
		let config = {
			method: "get",
			maxBodyLength: Infinity,
			url: this._apiUrl + `getbardata?symbol=${symbol}&response=json&interval=${interval}&from=${from}&to=${to}`,
			headers: {
				Authorization: "Bearer " + this._accessToken,
			},
		}
		const response = await axios.request(config)
		if (response.data.status == "Success") {
			return response.data
		}
		return false
	}
}

export default HistoricalData
