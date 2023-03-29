import { Schema } from "mongoose"

interface trades {
    id: string
    clientId: string
    exchange: string
    exchangeOrderNo: string
    fyToken: string
    orderDateTime: string
    orderNumber: string
    orderType: number
    productType: string
    row: number
    segment: string
    side: number
    symbol: string
    tradeNumber: string
    tradePrice: number
    tradeValue: number
    tradedQty: number
}

const TradesSchema: Schema = new Schema<trades>({
    id: { type: String, required: true },
    clientId: { type: String, required: true },
    exchange: { type: String, required: true },
    exchangeOrderNo: { type: String, required: true },
    fyToken: { type: String, required: true },
    orderDateTime: { type: String, required: true },
    orderNumber: { type: String, required: true },
    orderType: { type: Number, required: true },
    productType: { type: String, required: true },
    row: { type: Number, required: true },
    segment: { type: String, required: true },
    side: { type: Number, required: true },
    symbol: { type: String, required: true },
    tradeNumber: { type: String, required: true },
    tradePrice: { type: Number, required: true },
    tradeValue: { type: Number, required: true },
    tradedQty: { type: Number, required: true },
})



// clientId: "XV19818"

// exchange: "10"

// exchangeOrderNo: "1600000002467138"

// fyToken: "101123032952612"

// orderDateTime: "27-Mar-2023 09:18:17"

// orderNumber: "23032700007200"

// orderType: 2

// productType: "INTRADAY"
// row: 1679888897
// segment: "11"
// side: 1
// symbol: "NSE:BANKNIFTY23MAR39500CE"
// tradeNumber: "23032700007200-516223870"
// tradePrice: 317.9
// tradeValue: 7947.499999999999
// tradedQty: 25