import logger from "../logger"

export const fyersSocketOrderUpdateDataProcessing = (orderData: any) => {
	//* To be done later
	console.log("Order Data: ", orderData)
	const processData: any = {}
	return processData
}
export const fyersSocketPositionsUpdateDataProcessing = (positionData: any) => {
	//* To be done later
	console.log("Position Data: ", positionData)
	const processData: any = {}
	return processData
}

export const fyersSocketTradeUpdateDataProcessing = (tradeData: any) => {
	//* To be done later
	console.log("Trade Data: ", tradeData)
	const processData: any = {}
	return processData
}
export const fyersSocketUnknownDataProcessing = (data: any) => {
	//* To be done later
	console.log("Unknown Data: ", data)
	if (data.code == 1605) {
		logger.info("Fyers Subscription Successful", "FyersOrderSocketDPU")
	}
	const processData: any = {}
	return processData
}
