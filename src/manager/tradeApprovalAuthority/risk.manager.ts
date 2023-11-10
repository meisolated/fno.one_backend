import { tradesChatterInstance } from "../../events"

export default async function (user: any, newTradeDetails: any) {
    // to be done later, so approving all trades for now
    tradesChatterInstance.emit("tradeManager-", "log", { status: "approved", message: "no message", data: newTradeDetails, userId: user._id })
    return true
}
