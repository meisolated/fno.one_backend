import { Schema } from "mongoose"

interface session {
    session: string
    expires: number
    userId: string
}

export default new Schema<session>(
    {
        session: { type: String, required: true },
        expires: { type: Number, required: true },
        userId: { type: String, required: true },
    },
    { timestamps: true }
)
