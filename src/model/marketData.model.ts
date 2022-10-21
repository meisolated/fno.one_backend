import { Schema } from "mongoose"
interface marketData {
    high_price: number
    prev_close_price: number
    ch: number
    tt: number
    description: string
    short_name: string
    exchange: string
    low_price: number
    cmd: {
        c: number
        h: number
        l: number
        o: number
        t: number
        v: number
        tf: string
    }
    original_name: string
    chp: number
    open_price: number
    lp: number
    symbol: string
    LTQ: number
    L2_LTT: number
    ATP: number
    volume: number
    tot_buy: number
    tot_sell: number
    bid: number
    ask: number
    spread: number
    marketStat: number
}
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
