const indiesConfig = {
	BANKNIFTY: {
		lotSize: 15,
		name: "NIFTY BANK",
		strikePriceGap: 100,
		expiryDay: "wednesday",
		monthlyExpiryDay: "thursday",
	},
	NIFTY: {
		lotSize: 50,
		name: "NIFTY 50",
		strikePriceGap: 50,
		expiryDay: "thursday",
		monthlyExpiryDay: "thursday",
	},
	FINNIFTY: {
		lotSize: 40,
		name: "NIFTY FIN SERVICE",
		strikePriceGap: 50,
		expiryDay: "tuesday",
		monthlyExpiryDay: "thursday",
	},
}

function getLotSize(symbol) {
	const match = symbol.match(/([A-Z]+)\d+/)
	console.log(match)
	if (match) {
		const indiesKey = match[1]
		const indiesInfo = indiesConfig[indiesKey]

		if (indiesInfo) {
			return indiesInfo.lotSize
		}
	}

	// Symbol not found in the config
	return undefined
}

// Example usage:
const symbol = "NSE:BANKNIFTY23D0647300CE"
const lotSize = getLotSize(symbol)

if (lotSize !== undefined) {
	console.log(`Lot Size for ${symbol}: ${lotSize}`)
} else {
	console.log(`Symbol ${symbol} not found in the configuration`)
}