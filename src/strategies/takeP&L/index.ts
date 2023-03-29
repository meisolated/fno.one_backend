import { EventEmitter } from "events"
export default async function (chatter: EventEmitter) {
    const strategyDetails = {
        strategyName: "takeP&L",
        strategyDescription: "This strategy will take profit and loss",
        strategyVersion: "1.0.0",
        strategyAuthor: "Vivek",
        strategyParameters: {
            maxProfit: {
                type: "number",
                description: "Max profit in percentage",
                default: 0.5,
            },
        },
    }

    chatter.on("orderUpdate", (data: any) => {})
    chatter.on("marketDataUpdate", (data: any) => {})
}
