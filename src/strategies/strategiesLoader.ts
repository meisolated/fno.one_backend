import chatter from "../events"
import fs from "fs"
import logger from "../logger"

export default function strategiesLoader() {
	const runningStrategies = []
	const strategiesFolders = fs
		.readdirSync(__dirname, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
	strategiesFolders.forEach((folder) => {
		if (fs.existsSync(`${__dirname}/${folder}/index.js`)) {
			const strategy = require(`${__dirname}/${folder}/index.js`).default
			if (strategy.enabled) {
				logger.info(`Loading ${strategy.name} strategy`)
				logger.info(strategy)
			}
		} else {
			logger.info(`index.ts file not found in ${folder} folder`)
		}
	})
}
