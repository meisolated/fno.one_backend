import { Schema } from "mongoose"

interface user {
    _id: string
    email: string
    name: string
    fy_id: string
    image: string
    pan: string
    status: string
    role: string
    settings: {
        stopLoss: number
        takeProfit: number
        activeStrategies: string[]
        dailyTrades: number
    }
}

export default new Schema<user>(
    {
        _id: { type: String, required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
        fy_id: { type: String, required: true },
        image: { type: String, required: true },
        pan: { type: String, required: true },
        status: { type: String, required: true },
        role: { type: String, required: true },
        settings: {
            stopLoss: { type: Number, required: true },
            takeProfit: { type: Number, required: true },
            activeStrategies: [{ type: String, required: true }],
            dailyTrades: { type: Number, required: true },
        },
    },
    { timestamps: true }
)
