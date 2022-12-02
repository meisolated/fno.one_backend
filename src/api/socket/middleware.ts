import soket from "socket.io"
export default (socket: any) => {
    socket.on("connection", (socket: any) => {
        console.log("New client connected")
        if (!socket.handshake.query.token) {
            socket.disconnect()
        }
        socket.on("disconnect", () => {
            console.log("user disconnected", socket.handshake.query.token)
        })
    })
}
