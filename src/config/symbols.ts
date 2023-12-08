export const indicesSymbol = ["NIFTY 50", "NIFTY BANK", "NIFTY FIN SERVICE", "NIFTY IT", "INDIA VIX"]
export const bankNiftyUnderlyingAssets = ["HDFCNIFBAN", "SETFNIFBK", "ICICIBANKN", "KOTAKBANK", "AXISBANK", "INDUSINDBK", "AUBANK", "BANKBARODA", "FEDERALBNK", "BANDHANBNK"]
export default [...indicesSymbol, ...bankNiftyUnderlyingAssets]

interface iIndiesConfig {
	[key: string]: {
		lotSize: number
		name: string
		strikePriceGap: number
		expiryDay: string
		monthlyExpiryDay: string
	}
}

export const indiesConfig: iIndiesConfig = {
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
