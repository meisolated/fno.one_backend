import { WebSocket } from "ws"

let user = "FYERS1888"
let pwd = "70goUByG"
// enter the port you have been given for RT data. Production = 8082, Sandbox = 8084
let port = "8082"
var connection: any = null
var isConnected = connect()
var url = null
var previousClose = 0
// var heartbeattime = new Date(Date.now() + 3600 * 1000 * 5.5)

// setInterval(socketstatus, 2000)
// function socketstatus() {
//     console.log(heartbeattime)
// }
function connect() {
    console.log("Connecting..")
    url = "wss://push.truedata.in:" + port + "?user=" + user + "&password=" + pwd
    console.log(url)
    try {
        connection = new WebSocket(url)
        //console.log(connection.OPEN);

        connection.onopen = socketonopen
        connection.onerror = socketonerror
        connection.onmessage = socketonmessage
        connection.onclose = socketonclose

        return true
    } catch (error) {
        console.log(error)
        setInterval(connect, 7000)
        return false
    }
}
function socketonopen(e: any) {
    console.log("Connected Websocket")
}
function socketonerror(e: any) {
    console.log("Websocket Error " + e.message)
}

function socketonmessage(e: any) {
    var jsonObj = JSON.parse(e.data)
    if (jsonObj.success) {
        switch (jsonObj.message) {
            case "TrueData Real Time Data Service":
                console.log("Symbols:" + jsonObj.maxsymbols + " Data:" + jsonObj.subscription + " Valid Upto: " + jsonObj.validity)
                var jsonRequest = {
                    method: "addsymbol",
                    symbols: ["NIFTY 50", "NIFTY BANK"],
                    // symbols: ["NIFTY BANK"],
                }
                let s = JSON.stringify(jsonRequest)
                connection.send(s)
                break
            case "symbols added":
                console.log("Added Symbols:" + jsonObj.symbolsadded)
                break
            case "HeartBeat":
                // console.log("Message " + jsonObj.message + " Time: " + jsonObj.timestamp)
                break
            default:
                console.log(jsonObj)
        }
    }
    if (jsonObj.success == false) {
        console.log("Not connected")
    }
    if (jsonObj.trade != null) {
        //console.log(jsonObj.trade)
        // console.clear()
        var tradeArray = jsonObj.trade
        const changePercent = ((tradeArray[2] - previousClose) / previousClose) * 100
        console.log("\nSymbolId: " + tradeArray[0] + "\nTime: " + tradeArray[1] + "\nLTP:" + tradeArray[2] + "\nPrevious Close:" + previousClose + "\nChange Percentage:" + changePercent + "\nVolume:" + tradeArray[3])
        previousClose = tradeArray[2]
    }
    if (jsonObj.bidask != null) {
        var bidaskArray = jsonObj.bidask
        console.log("SymbolId: " + bidaskArray[0] + " Time: " + bidaskArray[1] + " Bid:" + bidaskArray[2] + " BidQty:" + bidaskArray[3] + " Ask:" + bidaskArray[4] + " AskQty:" + bidaskArray[5])
    }
    //setTimeout(closeConnection, 2000);
}

function closeConnection() {
    connection.close()
}

function socketonclose() {
    console.log("Disconnected Websocket")
    //process.exit(0);

    setTimeout(connect, 7000)
}
