import { baseSymbolsList } from "../provider/symbols.provider"
/**
 *
 * Get ticks data from symbolticks database and simulate the ticks
 * one tick per second
 */
import chatter from "../events"

export default async () => {
	const disabled = true
	if (disabled) return
	const symbolList = await baseSymbolsList()
	symbolList.forEach((symbol: string) => {
		//emit the ticks
		setInterval(() => {
			//prepare random ticks
			const randomTicks = Math.floor(Math.random() * 1000) + 1
			const randomPrice = Math.floor(Math.random() * 1000) + 1
			chatter.emit("marketData-", "tick", {
				symbol,
				ticks: randomTicks,
				lp: randomPrice,
			})
		}, 1000)
	})
}
