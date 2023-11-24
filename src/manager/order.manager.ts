import { tradesChatterInstance } from "../events"
import { placeSingleOrder } from "../lib/broker/fyers"

export default async (user: iUser, orderData: iNewOrder) => {
}


/**
 * Position Types
 * 1 - Long Position : Stop Loss and Target not so aggressive and RR ratio above or equal to 1:2
 * 2 - Scalping Position : Stop Loss and Target very aggressive and RR ratio below 1:1 at most 1:1.5
 * 3 - Swing Position : Stop Loss and Target aggressive and RR ratio above or equal to 1:1.5
 */
