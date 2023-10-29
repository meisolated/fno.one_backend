import compression from "compression"
import cookieParser from "cookie-parser"
import express, { Express, Request, Response, json, urlencoded } from "express"
import http from "http"
import * as path from "path"
import { Server } from "socket.io"

import middleware from "./api/middleware"
import LoadRoutes from "./api/routesLoader"
import socketLoader from "./api/socket"
import { getConfigData } from "./config/initialize"
import { subscribeToAllUsersSockets } from "./handler/fyers.handler"
import { connectTrueDataMarketDataSocket } from "./handler/trueData.handler"
import initialize from "./initialize"
import logger from "./logger"
import { allIndiesOptionChainGenerator } from "./provider/symbols.provider"
import { marketAlerts } from "./worker"

const app: Express = express()
const server = http.createServer(app)
const routesDirPath = path.join(__dirname, "/api/routes")

//-------------------- Starting Server --------------------
app.use(compression({ level: 9 }))
app.use(middleware)
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))
app.use(cookieParser())
app.get("/", (_req: Request, res: Response) => {
	res.send({ message: "Something is missing over here", code: 404 })
})

// -----------| Initializing |-----------
initialize()
	.then(async (_done) => {
		logger.info("Loading routes...", "Index")
		LoadRoutes(app, routesDirPath, "", false).then(async () => {
			logger.info("Routes loaded!", "Index")
			const config = getConfigData()
			const APIport: number = config.serverConf.APIPort
			const socketPort: number = config.serverConf.socketPort
			const io = new Server(socketPort)
			logger.info("Loading socket.io events...", "Index")
			socketLoader(io)
			logger.info("Socket.io events loaded!", "Index")
			await subscribeToAllUsersSockets()
			logger.info("Connecting to true data socket...", "Index")
			await connectTrueDataMarketDataSocket()
			logger.info("Connected to true data socket!", "Index")
			logger.info("Starting periodic updates worker...", "Index")
			logger.info("Periodic updates worker started!", "Index")
			logger.info("Starting market alerts...", "Index")
			marketAlerts()
			logger.info("Market alerts started!", "Index")
			logger.info("Starting server...", "Index")
			server.listen(APIport, () => {
				logger.info(`Server started on port ${APIport}`, "Index")
			})
			allIndiesOptionChainGenerator()
		})
	})
	.catch((_err) => {
		logger.error("Error while initializing", "Index")
		logger.error("Exiting...", "Index")
		process.exit(1)
	})
