import { Server } from "socket.io"
import globalSocket from "./global"
import userSocket from "./user"

function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

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
