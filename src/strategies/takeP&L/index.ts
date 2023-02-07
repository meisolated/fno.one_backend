import { EventEmitter } from "events"
export default async function (chatter: EventEmitter) {
    const strategyDetails = {
        strategyName: "takeP&L",
        strategyDescription: "This strategy will take profit and loss",
        strategyVersion: "1.0.0",
        strategyAuthor: "Vivek",
        strategyParameters: {
            symbol: {
                type: "string",
                description: "Symbol for which you want to take profit and loss",
                default: "NSE:NIFTYBANK-INDEX",
            },
            quantity: {
                type: "number",
                description: "Quantity of the symbol",
                default: 1,
            },
            takeProfit: {
                type: "number",
                description: "Take profit at this price",
                default: 10,
            },
            stopLoss: {
                type: "number",
                description: "Stop loss at this price",
                default: 10,
            },
        },
    }
    chatter.on("orderUpdate", (data: any) => {})
    chatter.on("marketDataUpdate", (data: any) => {})
}
