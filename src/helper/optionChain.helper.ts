const datePassedOrNot = (date: string) => {
    // date format DD-MM-YYYY
    const today = new Date()
    const dateArray = date.split("-")
    const dateObject = new Date(`${dateArray[1]}-${dateArray[0]}-${dateArray[2]}`)
    if (dateObject.getTime() < today.getTime()) {
        return true
    }
    return false
}

const dayToNumber = (day: string) => {
    switch (day) {
        case "MON":
            return 1
        case "TUE":
            return 2
        case "WED":
            return 3
        case "THU":
            return 4
        case "FRI":
            return 5
        case "SAT":
            return 6
        case "SUN":
            return 7
        default:
            return 0
    }
}
const generateUpcomingExpiryList = (expiryDay: string, howMany: number) => {

    const today = new Date()
    const todayDay = today.getDay()
    const todayDate = today.getDate()
    const todayMonth = today.getMonth()
    const todayYear = today.getFullYear()
    const expiryDayNumber = dayToNumber(expiryDay)
    const expiryList = []
    let expiryDate = 0
    let expiryMonth = 0
    let expiryYear = 0
    let expiryDateObject = new Date()
    if (todayDay === expiryDayNumber) {
        expiryDate = todayDate
        expiryMonth = todayMonth
        expiryYear = todayYear
    } else if (todayDay < expiryDayNumber) {
        expiryDate = todayDate + (expiryDayNumber - todayDay)
        expiryMonth = todayMonth
        expiryYear = todayYear
    } else {
        expiryDate = todayDate + (7 - todayDay + expiryDayNumber)
        expiryMonth = todayMonth
        expiryYear = todayYear
    }
    for (let i = 0; i < howMany; i++) {
        expiryDateObject = new Date(expiryYear, expiryMonth, expiryDate + i * 7)
        expiryList.push(`${expiryDateObject.getDate()}-${expiryDateObject.getMonth() + 1}-${expiryDateObject.getFullYear()}`)
    }
    return expiryList
}
const SingleMForMonth = (month: string) => {
    switch (month) {
        case "Jan":
            return "1"
        case "Feb":
            return "2"
        case "Mar":
            return "3"
        case "Apr":
            return "4"
        case "May":
            return "5"
        case "Jun":
            return "6"
        case "Jul":
            return "7"
        case "Aug":
            return "8"
        case "Sep":
            return "9"
        case "Oct":
            return "O"
        case "Nov":
            return "N"
        case "Dec":
            return "D"
    }
}

const symbolPrefixSelector = (symbol: string) => {
    if (symbol.includes("BankNifty")) return "NSE:BANKNIFTY"
}

const generateStrikePrices = (symbol: string, currentPrice: number, gap: number, range: number) => {
    const currentPriceRoundFigure = Math.round(currentPrice / 100) * 100
    const strikePrices = []
    const strikePriceWithSymbol = []
    const numberOfStrikePrices = range * 2 + 1
    for (let i = 0; i < numberOfStrikePrices; i++) {
        strikePrices.push(currentPriceRoundFigure + (i - range) * gap)
    }
    for (const strikePrice of strikePrices) {
        strikePriceWithSymbol.push({ symbol: `NSE:BANKNIFTY${strikePrice}CE`, strikePrice })
    }

    return strikePrices
}

export { datePassedOrNot, generateUpcomingExpiryList, dayToNumber, SingleMForMonth, symbolPrefixSelector, generateStrikePrices }
