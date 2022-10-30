import { Schema } from "mongoose"

interface session {
    _id: string
    session: string
    expires: Date
    user: string
}

export default new Schema<session>(
    {
        _id: { type: String, required: true },
        session: { type: String, required: true },
        expires: { type: Date, required: true },
        user: { type: String, required: true },
    },
    { timestamps: true }
)
