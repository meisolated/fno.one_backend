import { Server } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import logger from "../logger"
import globalSocket from "./global"
import userSocket from "./user"


export default function socketLoader(io: Server) {
    io.engine.generateId = () => {
        return uuidv4()
    }
    const globalInstance = io.of("/global")
    const userInstance = io.of("/user")
    const adminInstance = io.of("/admin")

    io.on("connection", (socket) => {
        const id = socket.id
        logger.info("New client connected " + id, false)
        if (!socket.handshake.query.token) {
            socket.disconnect()
        }
        socket.on("disconnect", () => {
            logger.info("user disconnected")
        })
        socket.on("ping", () => {
            logger.info("ping " + id, false)
            socket.emit("pong", "pong")
        })
    })
    globalSocket(io)
    userSocket(io)
}
