import { Server } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import { orderUpdateSocket } from "../../fyers"
import fyers2 from "../../lib/fyers"
import logger from "../../logger"
import { Session, User } from "../../model"
import globalSocket from "./global"
import userSocket from "./user"

export default function socketLoader(io: Server) {
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
            const sessionId = data.sessionId
            const userId = await Session.findOne({ session: sessionId })
            if (userId) {
                const user = await User.findOne({ _id: userId.userId })
                if (user) {
                    const connectionToOrderUpdatesSocket = new orderUpdateSocket()
                    connectionToOrderUpdatesSocket.onOrderUpdate(user.fyAccessToken, (data: any) => {
                        const dataToSend = JSON.stringify(data.data)
                        io.to(sessionId).emit("orderUpdate", dataToSend)
                    })

                    socket.join(sessionId)
                } else {
                    socket.disconnect()
                }
            } else {
                socket.disconnect()
            }

        })
    })


    // globalSocket(io)
    // userSocket(io)
}
