import chatter from "../events"

const symbolPair = [["NIFTY 50", "NIFTY BANK"]]
const ltp: { [key: string]: number } = {}
const symbolSyncInterval = 5 * 60 * 1000 // 5 minutes
const lastFiveMinuteLTP: { [key: string]: number } = {}
export default () => {
	chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {
		if (symbolPair[0].includes(symbolData.symbol)) {
			ltp[symbolData.symbol] = symbolData.lp
		}
	})
	setInterval(() => {
		if (lastFiveMinuteLTP["NIFTY 50"] && lastFiveMinuteLTP["NIFTY BANK"]) {
			const nifty50Diff = Math.abs(lastFiveMinuteLTP["NIFTY 50"] - ltp["NIFTY 50"])
			const niftyBankDiff = Math.abs(lastFiveMinuteLTP["NIFTY BANK"] - ltp["NIFTY BANK"])
			const nifty50DiffPercentage = ((nifty50Diff / lastFiveMinuteLTP["NIFTY 50"]) * 100).toFixed(3)
			const niftyBankDiffPercentage = ((niftyBankDiff / lastFiveMinuteLTP["NIFTY BANK"]) * 100).toFixed(3)
			const nifty50Side = lastFiveMinuteLTP["NIFTY 50"] - ltp["NIFTY 50"] > 0 ? "up" : "down"
			const niftyBankSide = lastFiveMinuteLTP["NIFTY BANK"] - ltp["NIFTY BANK"] > 0 ? "up" : "down"
			if (nifty50DiffPercentage <= niftyBankDiffPercentage && nifty50Side === niftyBankSide) {
				console.log("NIFTY 50 is in sync with NIFTY BANK", nifty50DiffPercentage, niftyBankDiffPercentage, nifty50Side, niftyBankSide)
			} else {
				console.log("NIFTY 50 is not in sync with NIFTY BANK", nifty50DiffPercentage, niftyBankDiffPercentage, nifty50Side, niftyBankSide)
			}

			lastFiveMinuteLTP["NIFTY 50"] = ltp["NIFTY 50"]
			lastFiveMinuteLTP["NIFTY BANK"] = ltp["NIFTY BANK"]
		} else {
			lastFiveMinuteLTP["NIFTY 50"] = ltp["NIFTY 50"]
			lastFiveMinuteLTP["NIFTY BANK"] = ltp["NIFTY BANK"]
		}
	}, symbolSyncInterval)
}
