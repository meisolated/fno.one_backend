import { Server } from "socket.io"
import globalSocket from "./global"
import userSocket from "./user"
export default function socketLoader(io: Server) {
    io.on("connection", (socket) => {
        console.log("New client connected")
        if (!socket.handshake.query.key) {
            socket.disconnect()
        }
        socket.on("disconnect", () => {
            console.log("user disconnected")
        })
    })
    globalSocket(io)
    userSocket(io)
}
