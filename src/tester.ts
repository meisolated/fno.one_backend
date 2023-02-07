import { generateSymbolStrikePrices } from "./manager/strikePrice.manager"

async function test() {
    const test = await generateSymbolStrikePrices("NIFTY BANK")
    console.log(test)
}
test()
