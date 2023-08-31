import { Socket } from "socket.io"
import logger from "../../logger"
import { Session } from "../../model"

export default async (socket: Socket, next: Function) => {
	logger.info(`Socket ${socket.id} connected`)
	if (socket.handshake.query.sessionId) {
		const userId = await Session.findOne({ session: socket.handshake.query.sessionId })
		if (!userId) {
			logger.info(`Socket ${socket.id} disconnected`)
			return socket.disconnect()
		}
		socket.data.userId = userId.userId
		logger.info(`Socket ${socket.id} authenticated`)
		next()
	} else {
		logger.info(`Socket ${socket.id} disconnected`)
		socket.disconnect()
	}
}
