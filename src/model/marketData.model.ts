import { Schema } from "mongoose"

export default new Schema<marketData>({
    id: { type: String, required: true, unique: true },
    BANKNIFTY: {
        derivativeName: String,
        expiryDates: [String],
        strikePrices: [Number],
        lastUpdateTime: String,
    },
    FINNIFTY: {
        derivativeName: { type: String, required: true },
        expiryDates: [String],
        strikePrices: [Number],
        lastUpdateTime: String,
    },
    NIFTY: {
        derivativeName: { type: String, required: true },
        expiryDates: [String],
        strikePrices: [Number],
        lastUpdateTime: String,
    },

    FnOHolidayList: [
        {
            holidayDate: String,
            holidayDescription: String,
        },
    ],
    lastUpdated: { type: String, required: true },
})
