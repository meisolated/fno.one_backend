import { Express, Request, Response } from "express"
import logger from "../logger"

export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, (_req: Request, res: Response) => {
        res.send({ message: "Something is missing over here", code: 200 })
    })
}
