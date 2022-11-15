import { Schema } from "mongoose"

interface user {
    email: string
    name: string
    displayName: string
    image: string
    pan: string
    status: string
    role: string[]
    settings: {
        stopLoss: number
        takeProfit: number
        activeStrategies: string[]
        dailyTrades: number
    }
    fyId: string
    fyAccessToken: string
    fyRefreshToken: string
    lastLogin: Date
    loggedIn: boolean
    socket: {
        marketData: {
            socket: any
            subscribed: boolean
            subscribedSymbols: string[]
        }
        order: {
            socket: any
            subscribed: boolean
        }
    }
}

export default new Schema<user>(
    {
        email: { type: String, required: true },
        name: { type: String, required: true },
        displayName: { type: String, required: true },
        image: { type: String, required: false },
        pan: { type: String, required: false },
        status: { type: String, required: true },
        role: [{ type: String, required: true }],
        settings: {
            stopLoss: { type: Number, required: false },
            takeProfit: { type: Number, required: false },
            activeStrategies: [{ type: String, required: false }],
            dailyTrades: { type: Number, required: false },
        },
        fyId: { type: String, required: true },
        fyAccessToken: { type: String, required: true },
        fyRefreshToken: { type: String, required: true },
        lastLogin: { type: Date, required: true },
        loggedIn: { type: Boolean, required: true },
        socket: {
            marketData: {
                socket: { type: Object, required: false },
                subscribed: { type: Boolean, required: false },
                subscribedSymbols: [{ type: String, required: false }],
            },
            order: {
                socket: { type: Object, required: false },
                subscribed: { type: Boolean, required: false },
            },
        },
    },
    { timestamps: true }
)
