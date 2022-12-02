import fs from "fs"
import path from "path"
import logger from "../logger"
import { Settings } from "../model"
import setupDB from "../model/setupDB"
const configDir = path.join(process.cwd() + "/dist/config/index.json")

export default () =>
    new Promise(async (resolve, reject) => {
        logger.info("Checking config file...", false)

        await setupDB()
        Settings.findOne({ id: 1 }).then(async (settings) => {
            await writeFile(settings)
                .then(() => {
                    return resolve({ status: "success", message: "Config file created" })
                })
                .catch((err) => {
                    return reject(err)
                })
        })
    })

const writeFile = (settings: any) =>
    new Promise((resolve, reject) => {
        let data = JSON.stringify(settings)
        fs.writeFile(configDir, data, (err) => {
            if (err) {
                logger.error(err.message, false)
                return reject(err)
            }
            logger.info("Config file created", false)
            return resolve({ status: "success", message: "Config file created" })
        })
    })
