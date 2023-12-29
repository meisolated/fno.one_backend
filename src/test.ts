/**
 * get data from mongodb filter by symbol NSE:NIFTYBANK-INDEX  and resolution 5min
 * after that loop through the data pick first candle of the day store it in a variable (9:15 am candle)
 * that 5min candle shouldn't be more than 200 point, if its above that then skip that day
 * if its below 200 point then store that candle in a variable now check when market is breaking high or low of that candle
 * when it does check how much market has moved from that breaking point if market breaks 60 point from that breaking point than store the hight points market gave and store it in an array
 * continue with the same day and check if market is also breaking the otherside of the same day, if it does then check how much market has moved from that breaking point if market breaks 60 point from that breaking point than store the low points market gave and store it in an array
 *
 */
// symbol: string
// resolution: string
// t: number // timestamp
// o: number // candle open
// h: number // candle high
// l: number // candle low
// c: number // candle close
// v: number // candle volume
