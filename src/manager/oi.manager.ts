import axios from "axios"
import config from "../config"
import logger from "../logger"
import { OpenInterest } from "../model"

/**
 * @deprecated
 * @returns
 * @description Not in use, will work on it later
 */
export async function updateOpenInterests() {
	// async function updateOI() {
	//     try {
	//         const OpenInterestData = await axios.get(config.NSEApi.NSEOptionChainDataAPIUrl)
	//         const OpenInterestDataArray = OpenInterestData.data.filtered
	//         const promises = OpenInterestDataArray.data.map(async (OpenInterestData: any) => {
	//             await OpenInterest.create({
	//                 symbol: OpenInterestData.PE.underlying,
	//                 expiryDate: OpenInterestData.expiryDate,
	//                 strikePrice: OpenInterestData.strikePrice,
	//                 timestamp: Date.now(),
	//                 CE: {
	//                     askPrice: OpenInterestData.CE.askPrice,
	//                     askQty: OpenInterestData.CE.askQty,
	//                     bidPrice: OpenInterestData.CE.bidPrice,
	//                     bidQty: OpenInterestData.CE.bidQty,
	//                     change: OpenInterestData.CE.change,
	//                     changeInOpenInterest: OpenInterestData.CE.changeInOpenInterest,
	//                     expiryDate: OpenInterestData.CE.expiryDate,
	//                     identifier: OpenInterestData.CE.identifier,
	//                     impliedVolatility: OpenInterestData.CE.impliedVolatility,
	//                     lastPrice: OpenInterestData.CE.lastPrice,
	//                     openInterest: OpenInterestData.CE.openInterest,
	//                     pChange: OpenInterestData.CE.pChange,
	//                     pChangeInOpenInterest: OpenInterestData.CE.pChangeInOpenInterest,
	//                     strikePrice: OpenInterestData.CE.strikePrice,
	//                     totalBuyQuantity: OpenInterestData.CE.totalBuyQuantity,
	//                     totalSellQuantity: OpenInterestData.CE.totalSellQuantity,
	//                     totalTradedVolume: OpenInterestData.CE.totalTradedVolume,
	//                     underlying: OpenInterestData.CE.underlying,
	//                     underlyingValue: OpenInterestData.CE.underlyingValue,
	//                     volumeWeightedAveragePrice: OpenInterestData.CE.volumeWeightedAveragePrice,
	//                 },
	//                 PE: {
	//                     askPrice: OpenInterestData.PE.askPrice,
	//                     askQty: OpenInterestData.PE.askQty,
	//                     bidPrice: OpenInterestData.PE.bidPrice,
	//                     bidQty: OpenInterestData.PE.bidQty,
	//                     change: OpenInterestData.PE.change,
	//                     changeInOpenInterest: OpenInterestData.PE.changeInOpenInterest,
	//                     expiryDate: OpenInterestData.PE.expiryDate,
	//                     identifier: OpenInterestData.PE.identifier,
	//                     impliedVolatility: OpenInterestData.PE.impliedVolatility,
	//                     lastPrice: OpenInterestData.PE.lastPrice,
	//                     openInterest: OpenInterestData.PE.openInterest,
	//                     pChange: OpenInterestData.PE.pChange,
	//                     pChangeInOpenInterest: OpenInterestData.PE.pChangeInOpenInterest,
	//                     strikePrice: OpenInterestData.PE.strikePrice,
	//                     totalBuyQuantity: OpenInterestData.PE.totalBuyQuantity,
	//                     totalSellQuantity: OpenInterestData.PE.totalSellQuantity,
	//                     totalTradedVolume: OpenInterestData.PE.totalTradedVolume,
	//                     underlying: OpenInterestData.PE.underlying,
	//                     underlyingValue: OpenInterestData.PE.underlyingValue,
	//                     volumeWeightedAveragePrice: OpenInterestData.PE.volumeWeightedAveragePrice,
	//                 },
	//             })
	//         })
	//         await Promise.all(promises)
	//     } catch (error) {
	//         logger.error(`Error in updating Open Interest Data: ${error}`)
	//     }
	// }
	// setInterval(async () => {
	//     logger.info("Updating Open Interest Data")
	//     updateOI()
	// }, 1000 * 60 * 3)
}
