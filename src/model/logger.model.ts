import { Schema } from "mongoose"

interface logger {
    message: string
    type: string
    by: string //[user, server]
    user: string //[null or userId]
    date: Date
}

export default new Schema<logger>({
    message: { type: String, required: true },
    type: { type: String, required: true },
    by: { type: String, required: true },
    user: { type: String, required: false },
    date: { type: Date, required: true },
})
