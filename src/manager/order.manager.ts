import { tradesChatterInstance } from "../events"

export default async () => {}

/**
 * Position Types
 * 1 - Long Position : Stop Loss and Target not so aggressive and RR ratio above or equal to 1:2
 * 2 - Scalping Position : Stop Loss and Target very aggressive and RR ratio below 1:1 at most 1:1.5
 * 3 - Swing Position : Stop Loss and Target aggressive and RR ratio above or equal to 1:1.5
 */
