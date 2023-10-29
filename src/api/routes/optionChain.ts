import { Express, Request, Response } from "express"
import config from "../../config"
import symbols, { indiesConfig } from "../../config/symbols"
import logger from "../../logger"
import { SymbolData } from "../../model"
import { allIndiesOptionChainGenerator } from "../../provider/symbols.provider"
export default async function (app: Express, path: string) {
	logger.info("Loaded route: " + path, "routes")
	app.get(path, async (req: Request, res: Response) => {
		const allIndiesOptionChain = await allIndiesOptionChainGenerator()
		const indexAndEQData = await SymbolData.find({ trueDataSymbol: { $in: [...symbols] } }) //.then((data: any) => data.toObject())
		res.send({ code: 200, message: "Success", indexLTP: indexAndEQData, allIndiesOptionChain, indiesConfig, indies: config.indies })
	})
}
