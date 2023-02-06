import { Socket } from "socket.io"
import { Session } from "../../model"

export default async (socket: Socket, next: Function) => {
    console.log(`Socket ${socket.id} connected`)
    if (socket.handshake.query.sessionId) {
        const userId = await Session.findOne({ session: socket.handshake.query.sessionId })
        if (!userId) {
            console.log(`Socket ${socket.id} disconnected`)
            return socket.disconnect()
        }
        socket.data.userId = userId.userId
        console.log(`Socket ${socket.id} authenticated`)
        next()
    } else {
        console.log(`Socket ${socket.id} disconnected`)
        socket.disconnect()
    }
}
