import fs from "fs"
import logger from "../logger"
import { Settings } from "../model"
import setupDB from "../model/setupDB"

export default (configDir: string) =>
    new Promise((resolve, reject) => {
        Settings.findOne({ id: 1 }).then(async (settings) => {
            if (settings) {
                Settings.findOne({ id: 1 }).then(async (settings) => {
                    await writeFile(configDir, settings)
                        .then(() => {
                            return resolve({ status: "success", message: "Config file created" })
                        })
                        .catch((err) => {
                            return reject(err)
                        })
                })
            } else {
                await setupDB()
                Settings.findOne({ id: 1 }).then(async (settings) => {
                    await writeFile(configDir, settings)
                        .then(() => {
                            return resolve({ status: "success", message: "Config file created" })
                        })
                        .catch((err) => {
                            return reject(err)
                        })
                })
            }
        })
    })

const writeFile = (configDir: string, settings: any) =>
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
