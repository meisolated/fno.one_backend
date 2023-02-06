import { EventEmitter } from "events"
import { Server } from "socket.io"
import middleware from "./middleware"
// import { orderUpdateSocket } from "../../lib/fyers"
import logger from "../../logger"
import { Session, User } from "../../model"
import { default as userSocketNamespace } from "./namespace/user"
import { default as publicSocketNamespace } from "./namespace/public"
export default function socketLoader(io: Server, chatter: EventEmitter) {
    // Namespaces
    const userSocket = io.of("/user")
    const publicSocket = io.of("/public")
    userSocketNamespace(userSocket, chatter)
    publicSocketNamespace(publicSocket, chatter)
}
