import { EventEmitter } from "events"
import { Namespace, Server } from "socket.io"
import middleware from "../middleware"
export default function publicSocketNamespace(socket: Namespace, chatter: EventEmitter) {
    socket.use(middleware)
    socket.on("connection", async (_socket) => {
        const id = _socket.id
        _socket.on("disconnect", () => {})
        _socket.on("subscribeMarketDataUpdate", async (data) => {
            _socket.emit("marketDataUpdate", JSON.stringify({ message: "Market data update socket connected" }))
        })
    })
    chatter.on("marketDataUpdate", (data) => {
        socket.emit("marketDataUpdate", JSON.stringify(data))
    })
}
