import { Express, Request, Response } from "express"
import logger from "../../logger"
import { generateSymbolOptionChain } from "../../manager/strikePrice.manager"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        const symbol: any = req.query.symbol
        console.log(symbol)
        const optionChain = await generateSymbolOptionChain(symbol)
        res.send({ ...optionChain })
    })
}
