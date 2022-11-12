import { Express, Request, Response } from "express"

export default async function (app: Express, path: string) {
    console.log("Loaded route: " + path)
    app.get(path, (_req: Request, res: Response) => {
        res.send({ message: "Something is missing over here", code: 200 })
    })
}
