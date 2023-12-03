import events from "events"
import logger from "../logger"
import sensitiveLog from "../logger/sensitiveLog"
const chatter = new events.EventEmitter()

class Chatter {
	chatter: events.EventEmitter = chatter
	constructor() {
		// log all whenever a new listener is added and removed
		this.chatter.on("newListener", (event, listener) => {
			logger.info(`New Listener added for ${event}`, "CHATTER EVENTS")
		})
		this.chatter.on("removeListener", (event, listener) => {
			logger.info(`Listener removed for ${event}`, "CHATTER EVENTS")
		})
		this.chatter.on("error", (error) => {
			logger.error(`Error in chatter ${error}`, "CHATTER EVENTS")
		})
		this.chatter.on("removeAllListeners", (event) => {
			logger.info(`All Listeners removed for ${event}`, "CHATTER EVENTS")
		})
	}
	emit(eventPrefix: string, event: string, data: any) {
		this.storeSensitive(eventPrefix, event, data)
		this.chatter.emit(eventPrefix + event, data)
	}
	on(eventPrefix: string, event: string, callback: (...args: any[]) => void) {
		this.chatter.on(eventPrefix + event, callback)
	}
	removeListener(eventPrefix: string, event: string, callback: (...args: any[]) => void) {
		this.chatter.removeListener(eventPrefix + event, callback)
	}
	removeAllListeners(eventPrefix: string, event: string) {
		this.chatter.removeAllListeners(eventPrefix + event)
	}

	storeSensitive(eventPrefix: string, event: string, data: any) {
		if (eventPrefix.includes("positionManager")) {
			sensitiveLog(`${eventPrefix} ${event} ${JSON.stringify(data)}`)
		}
	}
}

export default new Chatter()
