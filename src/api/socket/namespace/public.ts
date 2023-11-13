import { Namespace, Server } from "socket.io"
import chatter from "../../../events"
import logger from "../../../logger"
import middleware from "../middleware"

export default function publicSocketNamespace(socket: Namespace) {
	socket.use(middleware)
	socket.on("connection", async (_socket) => {
		const id = _socket.id
		_socket.on("disconnect", () => {
			chatter.removeAllListeners("symbolUpdateTicks-", "tick")
		})
		_socket.on("subscribeMarketDataUpdate", async (data) => {
			logger.info("subscribeMarketDataUpdate " + id, "PublicSocket")
			_socket.emit("marketDataUpdate", JSON.stringify({ message: "Market data update socket connected" }))
		})
		chatter.on("symbolUpdateTicks-", "tick", (data) => {
			_socket.emit("marketDataUpdate", JSON.stringify(data))
		})
	})
}
