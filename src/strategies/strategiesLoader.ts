import fs from "fs"
import chatter from "../events"
import logger from "../logger"
import { Strategies } from "../model"

export default async function strategiesLoader() {
	const runningStrategies = []
	const strategiesFolders = fs
		.readdirSync(__dirname, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
	strategiesFolders.forEach(async (folder) => {
		if (fs.existsSync(`${__dirname}/${folder}/index.js`)) {
			const strategy = require(`${__dirname}/${folder}/index.js`).default
			if (strategy.enabled) {
				const findInDb = await Strategies.findOne({ id: strategy.id })
				if (findInDb) {
					if (findInDb.enabled) {
						if (findInDb.markets.length == 0) return logger.info(`No markets found for ${strategy.name} strategy`)
						logger.info(`Loading ${strategy.name} strategy`)
						runningStrategies.push(strategy.id)
						strategy.run()
					}
				} else {
					await Strategies.create({
						id: strategy.id,
						name: strategy.name,
						description: strategy.description,
						enabled: false,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					})
				}
			}
		} else {
			logger.info(`index.ts file not found in ${folder} folder`)
		}
	})
}
