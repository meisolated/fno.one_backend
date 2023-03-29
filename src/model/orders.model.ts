import { Schema } from "mongoose"


interface trades {
    id: string
    orderDateTime: string
    orderId: string
    exchOrdId: string
    side: number
    segment: number
    instrument: string
    productType: string
    status: number
    qty: number
    remainingQuantity: number
    filledQty: number
    limitPrice: number
    stopPrice: number
    type: number
    discloseQty: number
    dqQtyRem: number
    orderValidity: string
    source: string
    slNo: number
    fyToken: string
    offlineOrder: boolean
    message: string
    orderNumStatus: string
    tradedPrice: number
    exchange: number
    pan: string
    clientId: string
    symbol: string

}


// 'orderDateTime': '07-Aug-2020 13:43:08',
// 'id': '1200807100672',
// 'exchOrdId': '1300000010289593',
// 'side': 1,
// 'segment': 10, 
// 'instrument': ‘0’, 
// 'productType': 'CNC', 
// 'status': 2, 
// 'qty': 20,
// 'remainingQuantity': 0,
// 'filledQty': 20, 
// 'limitPrice': 0.0,
// 'stopPrice': 0.0, 
// 'type': 2, 
// 'discloseQty': 0, 
// 'dqQtyRem': 0,
// 'orderValidity': 'DAY', 
// 'source': 'W', 'slNo': 1, 
// 'fyToken': '101000000013188', 
// 'offlineOrder': False, 
// 'message': 'TRADE CONFIRMED', 
// 'orderNumStatus': '1200807100672:2',
// 'tradedPrice': 2.65, 
// 'exchange': 10, 
// 'pan': 'AXXXXXXXN', 
// 'clientId': 'FXXXXX', 
// 'symbol': 'NSE:RCOM-BE'