import { SymbolTicks } from "../model"
import chatter from "../events"
import logger from "../logger"

chatter.on("marketData-", "tick", async (data: any) => {
	try {
		await SymbolTicks.create(data)
	} catch (error: any) {
		logger.error(error.message, false, "", "events.handler.ts")
	}
})
