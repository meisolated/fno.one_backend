import axios from "axios"
import qs from "qs"

class HistoricalData {
	private _username: string
	private _password: string
	private _accessToken: string = ""
	private expireTime: number = 0
	private _apiUrl = "https://history.truedata.in/"
	constructor(username: string, password: string) {
		this._username = username
		this._password = password
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
					this.expireTime = Math.floor(Date.now() / 1000) + response.data.expires_in
					return true
				}
				return false
			})
			.catch((error) => {
				return false
			})
	}
	private async checkAccessToken() {
		if (this.expireTime < Math.floor(Date.now() / 1000)) {
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
}

export default HistoricalData
