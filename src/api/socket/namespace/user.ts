import { Namespace } from "socket.io"
import chatter from "../../../events"
import logger from "../../../logger"
import middleware from "../middleware"
export default function userSocketNamespace(socket: Namespace) {
	socket.use(middleware)
	socket.on("connection", async (_socket) => {
		const id = _socket.id
		const userId = _socket.data.userId
		_socket.on("disconnect", () => {
			chatter.removeAllListeners("fyersOrderUpdateSocket-", userId)
		})
		_socket.on("ping", () => {
			_socket.emit("pong", "pong")
		})
		_socket.on("subscribeOrderUpdate", async (data) => {
			logger.info("subscribeOrderUpdate " + id, "UserSocket")
			chatter.on("fyersOrderUpdateSocket-", userId, (data) => {
				_socket.to(userId).emit("orderUpdate", JSON.stringify(data))
			})
			_socket.join(userId)
			_socket.to(userId).emit("orderUpdate", JSON.stringify({ message: "Order update socket connected" }))
		})
		_socket.on("subscribeMarketAlerts", async (data) => {
			logger.info("subscribeMarketAlerts " + id, "UserSocket")
			chatter.on("marketAlerts-", userId, (data) => {
				_socket.to(userId).emit("marketAlerts", JSON.stringify(data))
			})
			_socket.join(userId)
			_socket.to(userId).emit("marketAlerts", JSON.stringify({ message: "Market alerts socket connected" }))
		})
	})
}
