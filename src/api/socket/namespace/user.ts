import { Namespace } from "socket.io"
import chatter, { tradesChatterInstance } from "../../../events"
import logger from "../../../logger"
import middleware from "../middleware"
export default function userSocketNamespace(socket: Namespace) {
	socket.use(middleware)
	socket.on("connection", async (_socket) => {
		const socketConnectionId = _socket.id
		const userId = _socket.data.userId
		_socket.on("disconnect", () => {
			chatter.removeAllListeners("fyersOrderUpdateSocket", userId)
			chatter.removeAllListeners("marketAlerts", userId)
			chatter.removeAllListeners("newTradeUpdates", userId)
			logger.info("User disconnected " + socketConnectionId, "UserSocket")
			console.log(socket.adapter.rooms)
		})
		_socket.on("subscribe", async (data) => {
			logger.info("subscribe " + socketConnectionId, "UserSocket")
			await _socket.join(userId)
			_socket.to(userId).emit("message", JSON.stringify({ message: "Socket connected" }))
		})

		// Ping pong
		_socket.on("ping", () => {
			const currentTime = new Date().toLocaleString()
			_socket.emit("pong", "pong " + currentTime)
		})
		// Order updates
		_socket.on("subscribeOrderUpdate", async (data) => {
			logger.info("subscribeOrderUpdate " + socketConnectionId, "UserSocket")
			await _socket.join(userId)
			_socket.to(userId).emit("orderUpdate", JSON.stringify({ message: "Order update socket connected" }))
		})

		// Market alerts
		_socket.on("subscribeMarketAlerts", async (data) => {
			logger.info("subscribeMarketAlerts " + socketConnectionId, "UserSocket")
			await _socket.join(userId)
			_socket.to(userId).emit("marketAlerts", JSON.stringify({ message: "Market alerts socket connected" }))
		})


		// Trade updates
		_socket.on("subscribeTradeUpdates", async (data) => {
			logger.info("subscribeTradeUpdates " + socketConnectionId, "UserSocket")
			await _socket.join(userId)
			console.log(socket.adapter.rooms)
			_socket.to(userId).emit("tradeUpdates", JSON.stringify({ message: "Trade updates socket connected" }))
		})

	})
	chatter.on("newTradeUpdates", "", (data) => {
		console.log("newTradeUpdates-", data)
		const userId = data.userId.toString()
		console.log(userId)
		socket.to(userId).emit("tradeUpdates", JSON.stringify(data))
	})
	chatter.on("marketAlerts", "", (data) => {
		const userId = data.userId.toString()
		socket.to(userId).emit("marketAlerts", JSON.stringify(data))
	})
	chatter.on("fyersOrderUpdateSocket", "", (data) => {
		const userId = data.userId.toString()
		socket.to(userId).emit("orderUpdate", JSON.stringify(data))
	})
}

