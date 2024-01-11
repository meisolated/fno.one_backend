import chatter from "../events"

let marketData: any = {}
let marketMovementData: any = {}
export default function () {
    chatter.on("symbolUpdateTicks-", "tick", async (symbolData: iSymbolTicks) => {

    })

}