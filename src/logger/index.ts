import chalk from "chalk"

type LogLevel = "info" | "error" | "warn" | "debug"

interface LoggerOptions {
	colors: Record<LogLevel, chalk.ChalkFunction>
}

class CustomLogger {
	private options: LoggerOptions

	constructor(options: LoggerOptions) {
		this.options = options
	}

	private log(level: LogLevel, message: string, sector?: string): void {
		const color = this.options.colors[level] || chalk.white
		const currentTime = new Date().toLocaleString()
		const formattedMessage = `[${level.toUpperCase()}] [${currentTime}] ${sector ? ` [${sector}]` : ""} - ${message}`

		console.log(color(formattedMessage))
	}

	info(message: string, sector?: string): void {
		this.log("info", message, sector)
	}

	error(message: string, sector?: string): void {
		this.log("error", message, sector)
	}

	warn(message: string, sector?: string): void {
		this.log("warn", message, sector)
	}

	debug(message: string, sector?: string): void {
		this.log("debug", message, sector)
	}
}

// Example usage
const logger = new CustomLogger({
	colors: {
		info: chalk.blue,
		error: chalk.red,
		warn: chalk.yellow,
		debug: chalk.green,
	},
})

export default logger
