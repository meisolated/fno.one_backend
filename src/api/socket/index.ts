import { Server } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import { EventEmitter } from "ws"
// import { orderUpdateSocket } from "../../lib/fyers"
import logger from "../../logger"
import { Session, User } from "../../model"

export default function socketLoader(io: Server, chatter: EventEmitter) {
    io.engine.generateId = () => {
        return uuidv4()
    }
    io.on("connection", (socket) => {
        const id = socket.id
        logger.info("New client connected " + id, false)
        if (!socket.handshake.query.sessionId) {
            socket.disconnect()
        }
        socket.on("disconnect", () => {
            logger.info("user disconnected")
        })
        socket.on("ping", () => {
            logger.info("ping " + id, false)
            socket.emit("pong", "pong")
        })
        socket.on("subscribeOrderUpdate", async (data) => {
            logger.info("subscribeOrderUpdate " + id, false)
            const sessionId: string = data.sessionId
            const userId = await Session.findOne({ session: sessionId })
            if (userId) {
                const user = await User.findOne({ _id: userId.userId })
                if (user) {
                    user.socketId = id
                    await user.save()
                    chatter.on(userId.userId, (data) => {
                        console.log(data)
                        io.to(sessionId).emit("orderUpdate", JSON.stringify(data))
                    })
                    socket.join(sessionId)
                    io.to(sessionId).emit("orderUpdate", JSON.stringify({ message: "Order update socket connected" }))
                } else {
                    socket.disconnect()
                }
            } else {
                socket.disconnect()
            }
        })
    })
}
