export const indicesSymbol = ["NIFTY 50", "NIFTY BANK", "NIFTY FIN SERVICE", "NIFTY IT", "INDIA VIX"]
export const bankNiftyUnderlyingAssets = ["HDFCNIFBAN", "SETFNIFBK", "ICICIBANKN", "KOTAKBANK", "AXISBANK", "INDUSINDBK", "AUBANK", "BANKBARODA", "FEDERALBNK", "BANDHANBNK"]
export default [...indicesSymbol, ...bankNiftyUnderlyingAssets]

export const indiesConfig = {
	BANKNIFTY: {
		lotSize: 15,
		name: "NIFTY BANK",
		strikePriceGap: 100,
	},
	NIFTY: {
		lotSize: 50,
		name: "NIFTY 50",
		strikePriceGap: 50,
	},
	FINNIFTY: {
		lotSize: 40,
		name: "NIFTY FIN SERVICE",
		strikePriceGap: 50,
	},
}
