import { Logger } from "../model"
function dateNTime() {
    return new Date().toLocaleString()
}
function log(message: string, type: string, by: string, user?: string) {
    Logger.create({
        message: message,
        type: type,
        by: by,
        user: user,
        date: new Date(),
    })
}
export default class logger {
    static log(message: string, user?: boolean, userId?: string) {
        const by = user ? "user" : "server"
        log(message, "log", by, userId)
        console.log(`[LOG] [${dateNTime()}] [${by}] - ${message}`)
    }

    static error(message: string, user?: boolean, userId?: string) {
        const by = user ? "user" : "server"
        log(message, "error", by, userId)
        console.log(`[ERROR] [${dateNTime()}] [${by}] - ${message}`)
    }

    static warn(message: string, user?: boolean, userId?: string) {
        const by = user ? "user" : "server"
        log(message, "warn", by, userId)
        console.log(`[WARN] [${dateNTime()}] [${by}] - ${message}`)
    }

    static info(message: string, user?: boolean, userId?: string) {
        const by = user ? "user" : "server"
        log(message, "info", by, userId)
        console.log(`[INFO] [${dateNTime()}] [${by}] - ${message}`)
    }

    static debug(message: string, user?: boolean, userId?: string) {
        const by = user ? "user" : "server"
        log(message, "debug", by, userId)
        console.log(`[DEBUG] [${dateNTime()}] [${by}] - ${message}`)
    }
}
