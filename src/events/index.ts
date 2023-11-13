import events from "events"
import sensitiveLog from "../logger/sensitiveLog"
const chatter = new events.EventEmitter()
const tradesChatter = new events.EventEmitter()
class Chatter {
	chatter: events.EventEmitter = chatter
	constructor() {}
	emit(eventPrefix: string, event: string, data: any) {
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
}

class TradesChatter {
	chatter: events.EventEmitter = tradesChatter
	constructor() {}
	emit(eventPrefix: string, event: string, data: any) {
		const dateNTime = new Date().toLocaleString()
		const dataString = JSON.stringify(data)
		sensitiveLog(dateNTime + "-" + eventPrefix + "-" + event + "-" + dataString)
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
}

export default new Chatter()
export const tradesChatterInstance = new TradesChatter()
