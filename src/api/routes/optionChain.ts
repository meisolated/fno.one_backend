import { Express, Request, Response } from "express"
import logger from "../../logger"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        const symbol: any = req.query.symbol
        const optionChain = [""]
        res.send({ ...optionChain })
    })
}
