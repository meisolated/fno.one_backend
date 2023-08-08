import chatter from "../../events"
import logger from "../../logger"

export default class TrafficLight {
	public enabled: boolean = true
	public name = "trafficLight"
	public id = "trafficLight"
	private _name: string = "trafficLight"
	private _candles: Array<{}> = []
	private _pair: {
		first: {
			open: number,
			close: number,
			time: string
		},
		second: {
			open: number,
			close: number,
			time: string
		},
		status: "looking" | "found"
	}


	constructor() {
		this._pair = {
			first: {
				open: 0,
				close: 0,
				time: ""
			},
			second: {
				open: 0,
				close: 0,
				time: ""
			},
			status: "looking"
		}
	}

	private strategyActive() {

		const currentTime = new Date()
		const currentMinute = currentTime.getMinutes()
		const currentSecond = currentTime.getSeconds()
		const currentHour = currentTime.getHours()
		if ((currentHour >= 9 && currentMinute >= 14) && (currentHour <= 15)) {
			return true
		}
		return false
	}

	public async run(markets: Array<string>) {
		logger.info(`Running ${this._name} strategy`)

		chatter.on("marketData-", "tick", (data) => {
			if (this._pair.status == "found") return
			if (!this.strategyActive()) return

			if (markets.includes(data.symbol)) {

				const currentTime = new Date()
				const currentMinute = currentTime.getMinutes().toString()
				const currentSecond = currentTime.getSeconds().toString()
				const currentHour = currentTime.getHours().toString()
				const currentCandle = {
					open: data.cmd.o,
					close: data.cmd.c,
					time: `${currentHour}:${currentMinute}`
				}
				const current5MinCandleHeadAdded = this._candles.filter((candle: any) => candle.time == `${currentHour}:${currentMinute}`)
				if (current5MinCandleHeadAdded.length > 0) return
				if (currentMinute.endsWith("5") || currentMinute.endsWith("0")) {
					if (this._candles.length == 0) {
						this._candles.push(currentCandle)
						console.log(this._candles)
						return
					}
					else {
						// verify candleHead is only 5mins ahead of that time and not more
						const candleHead: any = this._candles[0]
						const candleHeadTime = candleHead.time
						// check if we only only 5mins ahead of candleHead
						const candleHeadTimeSplit = candleHeadTime.split(":")
						const candleHeadMinute = candleHeadTimeSplit[1]
						const candleHeadHour = candleHeadTimeSplit[0]
						const candleHeadTimeInMinutes = parseInt(candleHeadHour) * 60 + parseInt(candleHeadMinute)
						const currentTimeInMinutes = parseInt(currentHour) * 60 + parseInt(currentMinute)
						const difference = currentTimeInMinutes - candleHeadTimeInMinutes
						if (difference == 5) {
							if (this._pair.first.open != 0 && this._pair.first.close != 0) {
								this._pair.first.open = candleHead.openPrice
								this._pair.first.close = data.openPrice
								console.log(this._pair)
							}
							else {
								this._pair.second.open = candleHead.openPrice
								this._pair.second.close = data.openPrice
								console.log(this._pair)
								pairMade()
							}
							this._candles = []
							this._candles.push(currentCandle)
						}
						else {
							this._candles = []
							logger.info("CandleHead is not 5mins ahead of current time")
						}
					}

				}

			}
		})

		const pairMade = () => {
			//verify if pair surpasses our criteria
			const firstPair = this._pair.first
			const secondPair = this._pair.second

			const firstPairDifference = (firstPair.close - firstPair.open) < 0 ? "red" : "green"
			const secondPairDifference = (secondPair.close - secondPair.open) < 0 ? "red" : "green"

			if (firstPairDifference == "red" && secondPairDifference == "green") {
				logger.info("Pair made")
				this._pair.status = "found"
				console.log({
					range: {
						open: firstPair.open,
						close: secondPair.close
					}
				})
				return true
			}
		}

	}
}
