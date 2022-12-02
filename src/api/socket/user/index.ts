import { Server } from "socket.io"
import { orderUpdateSocket } from "../../../fyers"
import logger from "../../../logger"
import { Session, User } from "../../../model"


export default function userSocket(io: Server) {
    const userInstance = io.of("/user")
    console.log("userSocket")
    userInstance.on("connection", async (socket) => {
        console.log(socket)
        const id = socket.id
        logger.info("New user client connected " + id, false)
        if (!socket.handshake.query.sessionId) {
            socket.disconnect()
        }
        socket.on("disconnect", () => {
            logger.info("user client disconnected")
        })
        socket.on("ping", () => {
            logger.info("user ping " + id, false)
            socket.emit("pong", "user pong")
        })

    })
}
