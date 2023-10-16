import fs from "fs"
import chatter from "../../events"
import logger from "../../logger"
import { Strategies } from "../../model"

export default async function strategiesLoader() {
	const strategiesFolders = fs
		.readdirSync(__dirname, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
	strategiesFolders.forEach(async (folder) => {
		if (fs.existsSync(`${__dirname}/${folder}/index.js`)) {
			const strategy = require(`${__dirname}/${folder}/index.js`).default
			const strgy = new strategy()
			if (strgy.enabled) {
				const findInDb = await Strategies.findOne({ id: strgy.id })
				if (findInDb) {
					if (findInDb.enabled) {
						if (findInDb.markets.length == 0) return logger.info(`No markets found for ${strgy.name} strategy`, "strategies/strategiesLoader.ts")
						logger.info(`Loading ${strgy.name} strategy`, "strategies/strategiesLoader.ts")
						strgy.run(findInDb.markets)
					}
				} else {
					await Strategies.create({
						id: strgy.id,
						name: strgy.name,
						description: strgy.description,
						enabled: false,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					})
				}
			}
		} else {
			logger.info(`index.ts file not found in ${folder} folder`, "strategies/strategiesLoader.ts")
		}
	})
}
