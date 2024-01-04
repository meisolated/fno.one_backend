import cron from "node-cron"
import { indiesConfig } from "../config/symbols"
import chatter from "../events"

var marketData: any = {}
const symbolPrefixes = ["BANKNIFTY", "NIFTY", "FINNIFTY"]
const indexSymbols = ["NIFTY BANK", "NIFTY 50", "NIFTY FIN SERVICE"]
const precision = [100, 50, 50]
const ATMStrikePrice = [0, 0, 0]
const ATMStrikePriceLTP = [0, 0, 0]
const vixSymbol = "INDIA VIX"

chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
	marketData[symbolData.fySymbol] = symbolData
})

const jobEvery1Minute = cron.schedule("* * * * *", async () => {})

function getATMStrikePrice(tick: iTrueDataMarketFeedsTouchlineData) {
	if (indexSymbols.includes(tick.symbol)) {
		const _precision = precision[indexSymbols.indexOf(tick.symbol)]
		const ATMStrikePrice = roundOff(tick.lp, _precision)
		return ATMStrikePrice
	}
	return false
}
function roundOff(num: number, precision: number) {
	const factor = precision === 100 ? 100 : 50
	return Math.round(num / factor) * factor
}
