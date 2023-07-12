import { Express, Request, Response } from "express"
import { sendTestMail } from "../../lib/mail"
import logger from "../../logger"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, async (req: Request, res: Response) => {
        sendTestMail()
        return res.send({ message: "Success", code: 200 })
    })
}
