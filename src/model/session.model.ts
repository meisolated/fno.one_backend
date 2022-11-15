import { Schema } from "mongoose"

interface session {
    session: string
    expires: Date
    userId: string
}

export default new Schema<session>(
    {
        session: { type: String, required: true },
        expires: { type: Date, required: true },
        userId: { type: String, required: true },
    },
    { timestamps: true }
)
