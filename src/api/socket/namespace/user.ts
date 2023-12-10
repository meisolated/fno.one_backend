import { Namespace } from "socket.io"
import chatter from "../../../events"
import logger from "../../../logger"
import middleware from "../middleware"
export default function userSocketNamespace(socket: Namespace) {
	socket.use(middleware)
	socket.on("connection", async (_socket) => {
		const socketConnectionId = _socket.id
		const userId = _socket.data.userId.toString()
		_socket.on("disconnect", () => {
			logger.info("User disconnected " + socketConnectionId, "UserSocket")
		})

		// Ping pong
		_socket.on("ping", () => {
			const currentTime = new Date().toLocaleString()
			_socket.emit("pong", "pong " + currentTime)
		})
		// Order updates
		_socket.on("subscribeOrderUpdate", async (data) => {
			logger.info("subscribeOrderUpdate " + socketConnectionId, "UserSocket")
			await _socket.join(userId + "-orderUpdate")
			// _socket.to(userId).emit("orderUpdate", JSON.stringify({ message: "Order update socket connected" }))
		})

		// Market alerts
		_socket.on("subscribeMarketAlerts", async (data) => {
			logger.info("subscribeMarketAlerts " + socketConnectionId, "UserSocket")
			await _socket.join(userId + "-marketAlerts")
			// _socket.to(userId).emit("marketAlerts", JSON.stringify({ message: "Market alerts socket connected" }))
		})

		// Trade updates
		_socket.on("subscribePositionUpdates", async (data) => {
			logger.info("subscribePositionUpdates " + socketConnectionId, "UserSocket")
			await _socket.join(userId + "-positionUpdates")
			// _socket.to(userId).emit("positionUpdates", JSON.stringify({ message: "Trade updates socket connected" }))
		})
	})
	chatter.on("positionManager-", "positionDetailsReceived", async (data: any) => {
		const userId = data.userId.toString()
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})
	chatter.on("positionManager-", "positionApprovedByRiskManager", async (data: any) => {
		const userId = data.userId.toString()
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})
	chatter.on("positionManager-", "positionRejectedByRiskManager", async (data: any) => {
		const userId = data.userId.toString()
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})
	chatter.on("positionManager-", "positionApprovedByMoneyManager", async (data: any) => {
		const userId = data.userId.toString()
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})
	chatter.on("positionManager-", "positionRejectedByMoneyManager", async (data: any) => {
		const userId = data.userId.toString()
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})
	chatter.on("positionManager-", "positionApproved", async (data: any) => {
		const userId = data.userId.toString()
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})
	chatter.on("positionManager-", "positionUpdated", async (data: any) => {
		const userId = data.userId
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})

	chatter.on("newTradeUpdates", "", (data) => {
		const userId = data.userId.toString()
		socket.to(userId + "-positionUpdates").emit("positionUpdates", JSON.stringify(data))
	})
	chatter.on("marketAlerts", "", (data) => {
		const userId = data.userId.toString()
		socket.to(userId + "-marketAlerts").emit("marketAlerts", JSON.stringify(data))
	})
	chatter.on("fyersOrderUpdateSocket", "", (data) => {
		console.log("fyersOrderUpdateSocket", data)
		const userId = data.userId.toString()
		socket.to(userId + "-orderUpdate").emit("orderUpdate", JSON.stringify(data))
	})
}
