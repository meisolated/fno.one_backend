import { Schema } from "mongoose"

interface openInterest {
    symbol: string
    timestamp: number
    strikePrice: number
    CE: {
        askPrice: number
        askQty: number
        bidPrice: number
        bidQty: number
        change: number
        changeInOpenInterest: number
        expiryDate: Date
        identifier: string
        impliedVolatility: number
        lastPrice: number
        openInterest: number
        pChange: number
        pChangeInOpenInterest: number
        strikePrice: number
        totalBuyQuantity: number
        totalSellQuantity: number
        totalTradedVolume: number
        underlyingValue: number
        underlying: string
    }
    PE: {
        askPrice: number
        askQty: number
        bidPrice: number
        bidQty: number
        change: number
        changeInOpenInterest: number
        expiryDate: Date
        identifier: string
        impliedVolatility: number
        lastPrice: number
        openInterest: number
        pChange: number
        pChangeInOpenInterest: number
        strikePrice: number
        totalBuyQuantity: number
        totalSellQuantity: number
        totalTradedVolume: number
        underlyingValue: number
        underlying: string
    }
}

export default new Schema<openInterest>(
    {
        symbol: { type: String, required: true },
        strikePrice: { type: Number, required: true },
        timestamp: { type: Number, required: true },
        CE: {
            askPrice: { type: Number, required: false },
            askQty: { type: Number, required: false },
            bidPrice: { type: Number, required: false },
            bidQty: { type: Number, required: false },
            change: { type: Number, required: false },
            changeInOpenInterest: { type: Number, required: false },
            expiryDate: { type: Date, required: false },
            identifier: { type: String, required: false },
            impliedVolatility: { type: Number, required: false },
            lastPrice: { type: Number, required: false },
            openInterest: { type: Number, required: false },
            pChange: { type: Number, required: false },
            pChangeInOpenInterest: { type: Number, required: false },
            strikePrice: { type: Number, required: false },
            totalBuyQuantity: { type: Number, required: false },
            totalSellQuantity: { type: Number, required: false },
            totalTradedVolume: { type: Number, required: false },
            underlyingValue: { type: Number, required: false },
            underlying: { type: String, required: false },
        },
        PE: {
            askPrice: { type: Number, required: false },
            askQty: { type: Number, required: false },
            bidPrice: { type: Number, required: false },
            bidQty: { type: Number, required: false },
            change: { type: Number, required: false },
            changeInOpenInterest: { type: Number, required: false },
            expiryDate: { type: Date, required: false },
            identifier: { type: String, required: false },
            impliedVolatility: { type: Number, required: false },
            lastPrice: { type: Number, required: false },
            openInterest: { type: Number, required: false },
            pChange: { type: Number, required: false },
            pChangeInOpenInterest: { type: Number, required: false },
            strikePrice: { type: Number, required: false },
            totalBuyQuantity: { type: Number, required: false },
            totalSellQuantity: { type: Number, required: false },
            totalTradedVolume: { type: Number, required: false },
            underlyingValue: { type: Number, required: false },
            underlying: { type: String, required: false },
        },
    },
    { timestamps: false }
)
