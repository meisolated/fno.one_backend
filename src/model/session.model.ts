import { Schema } from "mongoose"

interface session {
    _id: string
    session: string
    expires: Date
    user: {
        accessToken: string
        refreshToken: string
        expiry: Date
    }
}

export default new Schema<session>(
    {
        _id: { type: String, required: true },
        session: { type: String, required: true },
        expires: { type: Date, required: true },
        user: {
            accessToken: { type: String, required: true },
            refreshToken: { type: String, required: true },
            expiry: { type: Date, required: true },
        },
    },
    { timestamps: true }
)
