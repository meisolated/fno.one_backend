import { NextFunction, Request, Response } from "express"
export default function middleware(req: Request, res: Response, next: NextFunction) {
	const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress
	if (ip?.includes("103.62.95.22") || ip?.includes("::ffff:127.0.0.1")) {
		next()
	} else {
		console.log(ip)
		res.status(401).send({ message: "Unauthorized", code: 401 })
	}
}
