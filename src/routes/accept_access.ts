// res.cookie(name , 'value', {expire : new Date() + 9999});
// res.cookie(name, 'value', {maxAge : 9999});
// clearCookie('cookie_name'); // logout
import crypto from "crypto"
import { Express, Request, Response } from "express"
import { Session, User } from "model"
export default async function (app: Express, path: string) {
    console.log("Loaded route: " + path)
    app.get(path, (_req: Request, res: Response) => {
        if (_req.query.auth_code || _req.query.s == "ok") {
            const currentTimeUnixMs = Date.now()
            const cookie = crypto.randomBytes(64).toString("hex")
            const hash =
                "fno.one-" +
                crypto
                    .createHash("sha256")
                    .update(cookie + currentTimeUnixMs)
                    .digest("hex") +
                "ily"
            res.cookie("fno.on", hash, { maxAge: 1000 * 60 * 60 * 24 * 30 })

            res.send({ message: "Something is missing over here", code: 404 })
        } else {
            res.send({ message: "Something is missing over here", code: 404 })
        }
    })
}
