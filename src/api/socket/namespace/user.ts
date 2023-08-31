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
			logger.info("subscribeOrderUpdate " + id)
			chatter.on("fyersOrderUpdateSocket-", userId, (data) => {
				_socket.to(userId).emit("orderUpdate", JSON.stringify(data))
			})
			_socket.join(userId)
			_socket.to(userId).emit("orderUpdate", JSON.stringify({ message: "Order update socket connected" }))
		})
	})
}
