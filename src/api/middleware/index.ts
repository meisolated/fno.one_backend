import { NextFunction, Request, Response } from "express"
export default function middleware(req: Request, res: Response, next: NextFunction) {
	const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress
	if (ip == "103.62.93.150" || ip == "::ffff:127.0.0.1" || ip == "::ffff:10.69.69.171") {
		next()
	} else {
		res.status(401).send({ message: "Unauthorized", code: 401 })
	}
}
