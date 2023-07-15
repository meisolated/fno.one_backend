import { fyersOptionSymbolToTrueDataOptionSymbol, trueDataOptionSymbolToFyersOptionSymbol } from "./unit/converter.unit"

const first = fyersOptionSymbolToTrueDataOptionSymbol("NSE:BANKNIFTY20N0525000PE")
const second = trueDataOptionSymbolToFyersOptionSymbol("BANKNIFTY20043012000CE")

console.log(first)
console.log(second)