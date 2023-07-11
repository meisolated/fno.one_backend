import { Schema } from 'mongoose';

export default new Schema<order>({
    id: { type: String, required: true },
    orderDateTime: { type: String, required: true },
    orderId: { type: String, required: true },
    exchOrdId: { type: String, required: true },
    side: { type: Number, required: true },
    segment: { type: Number, required: true },
    instrument: { type: String, required: true },
    productType: { type: String, required: true },
    status: { type: Number, required: true },
    qty: { type: Number, required: true },
    remainingQuantity: { type: Number, required: true },
    filledQty: { type: Number, required: true },

    limitPrice: { type: Number, required: true },
    stopPrice: { type: Number, required: true },
    type: { type: Number, required: true },
    discloseQty: { type: Number, required: true },
    dqQtyRem: { type: Number, required: true },
    orderValidity: { type: String, required: true },
    source: { type: String, required: true },
    slNo: { type: Number, required: true },
    fyToken: { type: String, required: true },
    offlineOrder: { type: Boolean, required: true },
    message: { type: String, required: true },
    orderNumStatus: { type: String, required: true },
    tradedPrice: { type: Number, required: true },
    exchange: { type: Number, required: true },
    pan: { type: String, required: true },
    clientId: { type: String, required: true },
    symbol: { type: String, required: true },
    ch: { type: String, required: false },
    chp: { type: String, required: false },
    lp: { type: String, required: false },
    ex_sym: { type: String, required: false },
    description: { type: String, required: false },
});
