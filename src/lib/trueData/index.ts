import axios from "axios"
import { getConfigData } from "../../config/initialize"
import { TrueDataMonthStringToNumber } from "../../helper"
import logger from "../../logger"
import MarketFeeds from "./marketFeeds"
const config = getConfigData()

// https://api.truedata.in/getAllSymbols?segment=fo&user=FYERS1888&password=70goUByG&csv=false&allexpiry=false
// https://api.truedata.in/getOptionChain?user=FYERS1888&password=70goUByG&symbol=BANKNIFTY&expiry=20230831&csv=false

/**
 *
 * @param symbol
 * @param expiry
 * @returns LIST[SymbolId,Symbol,Side(CE/PE),"",(NSE/BSE),]
 */
const getOptionChainData = async (symbol: string, expiry: string) => {
	//expiry format DD-MM-YYYY
	const DD = expiry.split("-")[0]
	const MM = TrueDataMonthStringToNumber(expiry.split("-")[1])
	const YYYY = expiry.split("-")[2]
	// needed format YYYYMMDD
	const prepareExpiryDate = YYYY + MM + DD
	const url = `https://api.truedata.in/getOptionChain?user=${config.apis.trueData.username}&password=${config.apis.trueData.password}&symbol=${symbol}&expiry=${prepareExpiryDate}&csv=false`
	const data: any = await axios.get(url)
	if (data.status == "Success") {
		if (data.Records.length > 0) {
			return data.Records
		} else {
			return false
		}
	} else {
		return false
	}
}
const getAllSymbols = async (segment: string, allExpiry: boolean) => {
	const url = `https://api.truedata.in/getAllSymbols?segment=${segment}&user=FYERS1888&password=70goUByG&csv=false&allexpiry=${allExpiry}`
	logger.info(`[trueData.ts] getAllSymbols: Fetching symbols for segment: ${segment}`, "trueData[getAllSymbols]")
	const data: any = await axios.get(url).then((data) => data.data)
	if (data.status == "Success") {
		if (data.Records.length > 0) {
			return data.Records
		} else {
			console.log("success but no records")
			return false
		}
	} else {
		console.log("error")
		return false
	}
}

export default { MarketFeeds, getOptionChainData, getAllSymbols }
