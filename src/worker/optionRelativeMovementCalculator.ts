import chatter from "../events"

export default async () => {
	let previousData: any = []
	let currentData: any = []
	let relativeMovementData: any = []
	// chatter.on("symbolUpdateTicks-", "tick", (symbolData: symbolTicks) => {
	//     // now here what we are going to do is, record data every 1 minute
	//     // and then calculate the relative movement of the price in that 1 minute
	//     // and then record the same minute data for next calculation
	//     if (symbolData.symbol.includes("BANKNIFTY") || symbolData.symbol.includes("NIFTY BANK")) {
	//         const tt = symbolData.tt
	//         const time = new Date(tt)
	//         const seconds = time.getSeconds()
	//         const minutes = time.getMinutes()
	//         const hours = time.getHours()

	//         if (seconds === 0 || seconds === 1) {
	//             if (previousData.length <= 16) {
	//                 previousData.push({
	//                     lp: symbolData.lp,
	//                     time: symbolData.cmd.t,
	//                     symbol: symbolData.symbol
	//                 })
	//             } else {
	//                 currentData.push({
	//                     lp: symbolData.lp,
	//                     time: symbolData.cmd.t,
	//                     symbol: symbolData.symbol
	//                 })
	//             }
	//         }
	//         if (seconds === 10) {
	//             if (previousData.length === 0 && currentData.length == 0) return
	//             const _prvDataSpotLTP = previousData.find((data: any) => data.symbol === "NIFTY BANK").lp
	//             const _currDataSpotLTP = currentData.find((data: any) => data.symbol === "NIFTY BANK").lp
	//             if (_prvDataSpotLTP && _currDataSpotLTP) {
	//                 const differenceInSpotPrice = Math.abs(_prvDataSpotLTP - _currDataSpotLTP)
	//                 currentData.map((data: any) => {
	//                     const _previousData = previousData.find((prevData: any) => prevData.symbol === data.symbol)
	//                     if (!_previousData) return
	//                     const _differenceInOptionPrice = _previousData.lp - data.lp
	//                     const _relativeMovement = _differenceInOptionPrice / differenceInSpotPrice
	//                     relativeMovementData.push({
	//                         relativeMovement: _relativeMovement.toFixed(1),
	//                         differenceInSpotPrice,
	//                         open: _previousData.lp,
	//                         close: data.lp,
	//                         time: data.time,
	//                         symbol: data.symbol
	//                     })
	//                 })
	//                 previousData = []
	//                 currentData = []
	//                 // console.log(relativeMovementData)
	//             }
	//         }

	//     }

	// })

	return true
}
