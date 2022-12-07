import WebSocket from "ws"
let reconnectedValue = 0
function webSocketWrapper(url: string, dataToSubscribe: any, subscribeFun: any) {
    const pingFrequency = 6000
    const maxReconnectTimes = 10
    let isAlive = false

    const ws = new WebSocket(url)
    ws.binaryType = "arraybuffer"
    ws.on("open", function open() {
        console.log("connected")
        ws.send(dataToSubscribe)
        ws.send(JSON.stringify("ping"))
    })
    ws.on("error", function open(e) {
        console.log("error", e)
    })

    ws.on("closed", function open(e) {
        console.log("onclosed", e)
    })

    ws.onmessage = (res) => {
        if (typeof res.data === "string" && res.data.includes("pong")) {
            isAlive = true
            return
        } else {
            subscribeFun(res)
        }
    }

    let interValInstant = setInterval(() => {
        if (isAlive === false) {
            console.log("trying to reconnect", reconnectedValue)
            reconnectedValue++
            clearInterval(interValInstant)
            if (reconnectedValue <= maxReconnectTimes) {
                webSocketWrapper(url, dataToSubscribe, subscribeFun)
            } else {
                console.log("Error : Connection Error Please not able to connect to socket")
            }
        } else {
            isAlive = false
            reconnectedValue = 0
            ws.send(JSON.stringify("ping"))
        }
    }, pingFrequency)

    return ws
}

export default webSocketWrapper
