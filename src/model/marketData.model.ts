import { Schema } from "mongoose"

export default new Schema<marketData>(
    {
        high_price: { type: Number },
        prev_close_price: { type: Number },
        ch: { type: Number },
        tt: { type: Number },
        description: { type: String },
        short_name: { type: String },
        exchange: { type: String },
        low_price: { type: Number },
        cmd: {
            c: { type: Number },
            h: { type: Number },
            l: { type: Number },
            o: { type: Number },
            t: { type: Number },
            v: { type: Number },
            tf: { type: String },
        },
        original_name: { type: String },
        chp: { type: Number },
        open_price: { type: Number },
        lp: { type: Number },
        symbol: { type: String },
        LTQ: { type: Number },
        L2_LTT: { type: Number },
        ATP: { type: Number },
        volume: { type: Number },
        tot_buy: { type: Number },
        tot_sell: { type: Number },
        bid: { type: Number },
        ask: { type: Number },
        spread: { type: Number },
        marketStat: { type: Number },
    },
    { timestamps: true }
)
