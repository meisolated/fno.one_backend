import chalk from "chalk"
import fs from "fs"
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
		const logString = JSON.stringify(formattedMessage) + "\n"

		// check is logs folder exists
		if (!fs.existsSync("./logs")) {
			fs.mkdirSync("./logs")
		}
		const fileName = new Date().toLocaleDateString().replace(/\//g, "-")
		fs.appendFile(`./logs/${fileName}.log`, logString, (err: any) => {
			if (err) {
				console.error("Failed to write to log file:", err)
			}
		})
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
