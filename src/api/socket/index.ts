import { Server } from "socket.io"
import { default as publicSocketNamespace } from "./namespace/public"
import { default as userSocketNamespace } from "./namespace/user"
export default function socketLoader(io: Server,) {
    const userSocket = io.of("/user")
    const publicSocket = io.of("/public")
    userSocketNamespace(userSocket)
    publicSocketNamespace(publicSocket)
}
