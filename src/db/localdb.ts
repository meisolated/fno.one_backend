interface localdb {
    mainSymbol: string
    secondarySymbol: string
    t5BanksSymbol: Array<string>
    o5BanksSymbol: Array<string>
    NSEOptionQuoteDerivativeAPIUrl: string
    NSEOptionChainDataAPIUrl: string
}
const db: localdb = {
    mainSymbol: "NSE:NIFTYBANK-INDEX",
    secondarySymbol: "NSE:NIFTY50-INDEX",
    t5BanksSymbol: [
        "NSE:HDFCBANK-EQ",
        "NSE:SBIN-EQ",
        "NSE:ICICIBANK-EQ",
        "NSE:KOTAKBANK-EQ",
        "NSE:AXISBANK-EQ",
    ],
    o5BanksSymbol: [
        "NSE:INDUSINDBK-EQ",
        "NSE:AUBANK-EQ",
        "NSE:BANKBARODA-EQ",
        "NSE:FEDERALBNK-EQ",
        "NSE:BANDHANBNK-EQ",
    ],
    NSEOptionQuoteDerivativeAPIUrl:
        "https://www.nseindia.com/api/quote-derivative?symbol=BANKNIFTY",
    NSEOptionChainDataAPIUrl: "https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY",
}

export default db
