import chatter from "../events"
export default async () => {
	//first we need to convert them to one minute bars and then save them to DB for further use
	chatter.on("symbolUpdateTicks-", "tick", (symbolData: symbolTicks) => {
		// now symbolData.tt contains time in milliseconds
		// we need to check if that time is in round figure of 1 minute
		const tt = symbolData.tt
		const time = new Date(tt)
		const seconds = time.getSeconds()
		const minutes = time.getMinutes()
		const hours = time.getHours()
		const milliseconds = time.getMilliseconds()

		if (seconds === 0 && milliseconds === 0) {
			// console.log(symbolData.lp, symbolData, time)
		}
	})
}
