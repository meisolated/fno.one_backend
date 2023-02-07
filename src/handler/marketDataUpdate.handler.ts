import { EventEmitter } from "events"
export default async function (data: any, chatter: EventEmitter) {
    console.log(data)
    if (typeof data == "undefined") return
    if (data.s == "ok" && data.d["7208"].length > 0) {
        chatter.emit("marketDataUpdate", data.d["7208"][0].v)
    }
}
