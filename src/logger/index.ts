import { Logger } from "../model"
import chalk from "chalk"
import path from "path"

const _log = console.log
const red = chalk.red
const yellow = chalk.yellow
const blue = chalk.blue
const green = chalk.green
const cyan = chalk.cyan
const magenta = chalk.magenta
const white = chalk.white
const gray = chalk.gray

function dateNTime() {
	return new Date().toLocaleString()
}

function store(message: string, type: string, by: string, user?: string, from?: string) {
	Logger.create({
		message: message,
		type: type,
		by: by,
		user: user,
		date: new Date(),
		loggedFrom: from,
	})
}

function log(message: string, type: string, by: string, user?: string, from?: string) {
	store(message, type, by, user, from)
	if (user) {
		if (type === "error") _log(red(`[${type.toUpperCase()}] [${dateNTime()}] [${by}] [${from}] [${user}] - ${message}`))
		else if (type === "warn") _log(magenta(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] [${user}] - ${message}`))
		else if (type === "info") _log(blue(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] [${user}] - ${message}`))
		else if (type === "debug") _log(green(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] [${user}] - ${message}`))
		else _log(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] [${user}] - ${message}`)
		return
	} else {
		if (type === "error") _log(red(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] - ${message}`))
		else if (type === "warn") _log(magenta(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] - ${message}`))
		else if (type === "info") _log(blue(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] - ${message}`))
		else if (type === "debug") _log(green(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] - ${message}`))
		else _log(`[${type.toUpperCase()}] [${dateNTime()}] [${from}] [${by}] - ${message}`)
		return
	}
}

export default class logger {
	static log(message: string, user?: boolean, userId?: string, server?: string) {
		const stackTrace = new Error().stack || ""
		const stackLines = stackTrace.split("\n").slice(2)
		const callerLine = stackLines[0]
		// const lineNumber = parseInt(callerLine.match(/:(\d+):\d+$/)?.[1] || "0", 10) // not in use
		const fileName = callerLine.match(/\((.*):\d+:\d+\)$/)?.[1] || ""
		const from = `${path.relative(process.cwd(), fileName)}` || "♡"

		const by = user ? "user-" + userId : server ? "server-" + server : "server"
		log(message, "log", by, userId, from)
	}

	static error(message: string, user?: boolean, userId?: string, server?: string) {
		const stackTrace = new Error().stack || ""
		const stackLines = stackTrace.split("\n").slice(2)
		const callerLine = stackLines[0]
		const lineNumber = parseInt(callerLine.match(/:(\d+):\d+$/)?.[1] || "0", 10)
		const fileName = callerLine.match(/\((.*):\d+:\d+\)$/)?.[1] || ""
		const from = `${path.relative(process.cwd(), fileName)}` || "♡"

		const by = user ? "user-" + userId : server ? "server-" + server : "server"
		log(message, "error", by, userId, from)
	}

	static warn(message: string, user?: boolean, userId?: string, server?: string) {
		const stackTrace = new Error().stack || ""
		const stackLines = stackTrace.split("\n").slice(2)
		const callerLine = stackLines[0]
		const lineNumber = parseInt(callerLine.match(/:(\d+):\d+$/)?.[1] || "0", 10)
		const fileName = callerLine.match(/\((.*):\d+:\d+\)$/)?.[1] || ""
		const from = `${path.relative(process.cwd(), fileName)}` || "♡"

		const by = user ? "user-" + userId : server ? "server-" + server : "server"
		log(message, "warn", by, userId, from)
	}

	static info(message: string, user?: boolean, userId?: string, server?: string) {
		const stackTrace = new Error().stack || ""
		const stackLines = stackTrace.split("\n").slice(2)
		const callerLine = stackLines[0]
		const lineNumber = parseInt(callerLine.match(/:(\d+):\d+$/)?.[1] || "0", 10)
		const fileName = callerLine.match(/\((.*):\d+:\d+\)$/)?.[1] || ""
		const from = `${path.relative(process.cwd(), fileName)}` || "♡"

		const by = user ? "user-" + userId : server ? "server-" + server : "server"
		log(message, "info", by, userId, from)
	}

	static debug(message: string, user?: boolean, userId?: string, server?: string) {
		const stackTrace = new Error().stack || ""
		const stackLines = stackTrace.split("\n").slice(2)
		const callerLine = stackLines[0]
		const lineNumber = parseInt(callerLine.match(/:(\d+):\d+$/)?.[1] || "0", 10)
		const fileName = callerLine.match(/\((.*):\d+:\d+\)$/)?.[1] || ""
		const from = `${path.relative(process.cwd(), fileName)}` || "♡"

		const by = user ? "user-" + userId : server ? "server-" + server : "server"
		log(message, "debug", by, userId, from)
	}
	static doNotLog(message: string, user?: boolean, userId?: string, server?: string) {
		const stackTrace = new Error().stack || ""
		const stackLines = stackTrace.split("\n").slice(2)
		const callerLine = stackLines[0]
		const lineNumber = parseInt(callerLine.match(/:(\d+):\d+$/)?.[1] || "0", 10)
		const fileName = callerLine.match(/\((.*):\d+:\d+\)$/)?.[1] || ""
		const from = `${path.relative(process.cwd(), fileName)}` || "♡"

		const by = user ? "user-" + userId : server ? "server-" + server : "server"
		store(message, "doNotLog", by, userId, from)
	}
}
