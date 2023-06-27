import events from "events"
const chatter = new events.EventEmitter()

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

export default new Chatter()
