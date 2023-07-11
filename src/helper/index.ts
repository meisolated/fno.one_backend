import { getMarketCurrentPrice } from "./marketData.helper"
import { SingleMForMonth, datePassedOrNot } from "./optionChain.helper"

const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
function sum(a: number, b: number) {
    return a + b
}
const isTodayHoliday = () => {
    const todayDay = new Date().getDay()
    // if today is sunday or saturday
    if (todayDay === 0 || todayDay === 6) {
        return true
    } else {
        return false
    }
}

export { SingleMForMonth, datePassedOrNot, getMarketCurrentPrice, isTodayHoliday, sum, timeout }
