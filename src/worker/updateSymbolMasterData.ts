import trueData from "../lib/trueData"
import { SymbolData } from "../model"

export default async function updateSymbolMasterData() {
	//delete everything in symbol data
	return true
	//! this function is disabled for now
	// await SymbolData.deleteMany({})
	// const FnOSymbolsData: any = await trueData.getAllSymbols("fo", false)
	// const EQSymbolsData: any = await trueData.getAllSymbols("eq", false)
	// console.log("data fetched")
	// const finalSymbolsData: any = [...FnOSymbolsData, ...EQSymbolsData]
	// if (finalSymbolsData.length > 0) {
	// 	console.log(finalSymbolsData.length, "records found")
	// 	await Promise.all(
	// 		finalSymbolsData.map(async (e: any) => {
	// 			const prepareData: any = {
	// 				trueDataSymbolId: e[0],
	// 				symbol: e[1],
	// 				fyersSymbol: "",
	// 				kiteSymbol: "",
	// 				trueDataSymbol: e[1],
	// 				ltp: 0,
	// 				lastUpdated: new Date(),
	// 			}
	// 			await SymbolData.create(prepareData)
	// 		}),
	// 	)
	// 	return true
	// } else {
	// 	console.log("no data found")
	// 	return false
	// }
}
