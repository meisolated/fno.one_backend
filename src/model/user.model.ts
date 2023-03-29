import { Schema } from "mongoose"

interface user {
    email: string
    name: string
    displayName: string
    image: string
    pan: string
    status: string
    roles: string[]
    settings: {
        stopLoss: number
        takeProfit: number
        activeStrategies: string[]
        dailyTrades: number
    }
    fyId: string
    fyAccessToken: string
    fyRefreshToken: string
    connectedApps: string[]
    apps: string[]
    userAppsData: {
        fyers: {
            accessToken: string
            refreshToken: string
            Id: string
            loggedIn: boolean
            loggedInTime: Date
            lastUpdates: {
                orders: Date
                trades: Date
                positions: Date
                holdings: Date
                margins: Date
                profile: Date
                marketStatus: Date
                marketDepth: Date
                marketFeed: Date
            }
        }
    }
    lastLogin: Date
    loggedIn: boolean

}

export default new Schema<user>(
    {
        email: { type: String, required: true },
        name: { type: String, required: true },
        displayName: { type: String, required: true },
        image: { type: String, required: false },
        pan: { type: String, required: false },
        status: { type: String, required: true },
        roles: [{ type: String, required: true }],
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
        connectedApps: [{ type: String, required: false }],
        apps: [{ type: String, required: false }],
        userAppsData: {
            fyers: {
                accessToken: { type: String, required: true },
                refreshToken: { type: String, required: true },
                Id: { type: String, required: true },
                loggedIn: { type: Boolean, required: true },
                loggedInTime: { type: Date, required: true },
                lastUpdates: {
                    orders: { type: Date, required: true },
                    trades: { type: Date, required: true },
                    positions: { type: Date, required: true },
                    holdings: { type: Date, required: true },
                    margins: { type: Date, required: true },
                    profile: { type: Date, required: true },
                    marketStatus: { type: Date, required: true },
                    marketDepth: { type: Date, required: true },
                    marketFeed: { type: Date, required: true },

                },
            }

        },

    },
    { timestamps: true }
)
