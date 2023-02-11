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
    static log(message: string, user?: boolean, userEmail?: string) {
        const by = user ? "user-" + userEmail : "server"
        log(message, "log", by, userEmail)
        console.log(`[LOG] [${dateNTime()}] [${by}] - ${message}`)
    }

    static error(message: string, user?: boolean, userEmail?: string) {
        const by = user ? "user-" + userEmail : "server"
        log(message, "error", by, userEmail)
        console.log(`[ERROR] [${dateNTime()}] [${by}] - ${message}`)
    }

    static warn(message: string, user?: boolean, userEmail?: string) {
        const by = user ? "user-" + userEmail : "server"
        log(message, "warn", by, userEmail)
        console.log(`[WARN] [${dateNTime()}] [${by}] - ${message}`)
    }

    static info(message: string, user?: boolean, userEmail?: string) {
        const by = user ? "user-" + userEmail : "server"
        log(message, "info", by, userEmail)
        console.log(`[INFO] [${dateNTime()}] [${by}] - ${message}`)
    }

    static debug(message: string, user?: boolean, userEmail?: string) {
        const by = user ? "user-" + userEmail : "server"
        log(message, "debug", by, userEmail)
        console.log(`[DEBUG] [${dateNTime()}] [${by}] - ${message}`)
    }
}
