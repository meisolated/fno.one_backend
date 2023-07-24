import { Namespace, Server } from "socket.io"

import chatter from "../../../events"
import middleware from "../middleware"

export default function publicSocketNamespace(socket: Namespace) {
	socket.use(middleware)
	socket.on("connection", async (_socket) => {
		const id = _socket.id
		_socket.on("disconnect", () => {})
		_socket.on("subscribeMarketDataUpdate", async (data) => {
			_socket.emit("marketDataUpdate", JSON.stringify({ message: "Market data update socket connected" }))
		})
	})
	chatter.on("marketData-", "tick", (data) => {
		socket.emit("marketDataUpdate", JSON.stringify(data))
	})
}
