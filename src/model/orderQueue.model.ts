import { Schema } from "mongoose"

interface IOrderQueue {
    symbol: string
    quantity: number
    price: number
    orderType: tOrderType
    orderSide: tOrderSide
    
}
export default new Schema<IOrderQueue>(
    {
    },
    { timestamps: false },
)
