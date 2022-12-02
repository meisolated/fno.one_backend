import logger from "../../../logger"
import { Server } from "socket.io"

export default function globalSocket(io: Server) {
    const globalInstance = io.of("/global")
    globalInstance.on("connection", (socket) => {
        const id = socket.id
        logger.info("New global client connected " + id, false)
        socket.on("disconnect", () => {
            logger.info("global client disconnected")
        })
        socket.on("ping", () => {
            logger.info("ping " + id, false)
            socket.emit("pong", "pong")
        })
    })
}
