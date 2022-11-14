import { Schema } from "mongoose"

interface session {
    _id: string
    session: string
    expires: Date
    userId: string
}

export default new Schema<session>(
    {
        _id: { type: String, required: true },
        session: { type: String, required: true },
        expires: { type: Date, required: true },
        userId: { type: String, required: true },
    },
    { timestamps: true }
)
