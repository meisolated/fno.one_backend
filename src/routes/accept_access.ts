import { Express, Request, Response } from "express"
import { Session, User } from "model"

export default async function (app: Express, path: string) {
    console.log("Loaded route: " + path)
    app.get(path, (_req: Request, res: Response) => {
        // res.cookie(name , 'value', {expire : new Date() + 9999});
        // res.cookie(name, 'value', {maxAge : 9999});
        // clearCookie('cookie_name'); // logout
        res.send({ message: "Something is missing over here", code: 200 })
    })
}
