import { Schema } from "mongoose"

interface openInterest {
    _id: string
    symbol: string
    timestamp: Date
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
        _id: { type: String, required: true },
        symbol: { type: String, required: true },
        timestamp: { type: Date, required: true },
        CE: {
            askPrice: { type: Number, required: true },
            askQty: { type: Number, required: true },
            bidPrice: { type: Number, required: true },
            bidQty: { type: Number, required: true },
            change: { type: Number, required: true },
            changeInOpenInterest: { type: Number, required: true },
            expiryDate: { type: Date, required: true },
            identifier: { type: String, required: true },
            impliedVolatility: { type: Number, required: true },
            lastPrice: { type: Number, required: true },
            openInterest: { type: Number, required: true },
            pChange: { type: Number, required: true },
            pChangeInOpenInterest: { type: Number, required: true },
            strikePrice: { type: Number, required: true },
            totalBuyQuantity: { type: Number, required: true },
            totalSellQuantity: { type: Number, required: true },
            totalTradedVolume: { type: Number, required: true },
            underlyingValue: { type: Number, required: true },
            underlying: { type: String, required: true },
        },
        PE: {
            askPrice: { type: Number, required: true },
            askQty: { type: Number, required: true },
            bidPrice: { type: Number, required: true },
            bidQty: { type: Number, required: true },
            change: { type: Number, required: true },
            changeInOpenInterest: { type: Number, required: true },
            expiryDate: { type: Date, required: true },
            identifier: { type: String, required: true },
            impliedVolatility: { type: Number, required: true },
            lastPrice: { type: Number, required: true },
            openInterest: { type: Number, required: true },
            pChange: { type: Number, required: true },
            pChangeInOpenInterest: { type: Number, required: true },
            strikePrice: { type: Number, required: true },
            totalBuyQuantity: { type: Number, required: true },
            totalSellQuantity: { type: Number, required: true },
            totalTradedVolume: { type: Number, required: true },
            underlyingValue: { type: Number, required: true },
            underlying: { type: String, required: true },
        }
    },
    { timestamps: true }
)