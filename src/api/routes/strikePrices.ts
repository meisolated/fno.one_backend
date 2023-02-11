import { Express, Request, Response } from "express"
import logger from "../../logger"
import { generateSymbolStrikePrices } from "./../../manager/strikePrice.manager"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        if (true) return res.send({ code: 404, message: "Strike prices not found" })
        // const symbol: string = typeof req.query.symbol == "string" ? req.query.symbol : "NIFTY BANK"
        // const strikePrices: any = await generateSymbolStrikePrices(symbol)
        // if (!strikePrices) return res.send({ code: 404, message: "Strike prices not found" })
        // return res.send({ strikePrices, code: 200, message: "Success" })
    })
}
