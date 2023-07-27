import { Express, Request, Response } from "express"
import { currentExpiry, getExpiryList } from "../../provider/marketData.provider"

import logger from "../../logger"
import { optionChainSymbols } from "../../provider/symbols.provider"

export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path)
	app.get(path, async (req: Request, res: Response) => {
		const symbol: any = req.query.symbol
		if (symbol) {
			const optionChainList = await optionChainSymbols(symbol)
			const expiryList = await getExpiryList(symbol)
			const _currentExpiry = await currentExpiry(symbol)
			res.send({ code: 200, message: "Success", optionChainList, expiryList, currentExpiry: _currentExpiry })
		} else {
			res.send({ code: 200, message: "No symbol provided" })
		}
	})
}
