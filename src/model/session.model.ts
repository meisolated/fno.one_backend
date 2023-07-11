import { Schema } from 'mongoose';

export default new Schema<session>(
    {
        session: { type: String, required: true },
        expires: { type: Number, required: true },
        userId: { type: String, required: true },
    },
    { timestamps: true },
);
