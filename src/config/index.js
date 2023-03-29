"use strict"
exports.__esModule = true
var config = {
    APIPort: 3011,
    socketPort: 3012,
    fyers: {
        appId: "6UL65YECYS-100",
        secretId: "UXHPXH080I",
        redirectUrl: "https://fno.one/internal_api/accept_access",
        callbackSecret: "EpHAgErSAbsItYPTicTOUSCHIPOLoqUiDEoUsebAgNEYnoZenI",
        apiUrl: "https://api.fyers.in/api/v2/",
        dataApiUrl: "https://api.fyers.in/data-rest/v2/",
        webSocketUrl: "https://api.fyers.in/socket/v2/dataSock",
        status: true,
    },
    zerodhaKite: {
        apiKey: "jkkkoau0ybk8jk80",
        apiSecret: "okliqfjzvjbq05extuprm7sbqyiivnl9",
        redirectUrl: "https://fno.one/internal_api/accept_access",
        apiUrl: "https://api.kite.trade/",
        status: true,
    },
    fyersTrueData: {
        username: "FYERS1888",
        password: "70goUByG",
        status: false,
    },
    NSEApi: {
        NSEOptionQuoteDerivativeAPIUrl: "https://www.nseindia.com/api/quote-derivative?symbol=BANKNIFTY",
        NSEOptionChainDataAPIUrl: "https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY",
    },
    SMTP: {
        host: "mail.privateemail.com",
        port: 465,
        secure: true,
        auth: {
            user: "info@tradewithus.in",
            pass: "z7y6FMG2YG5KwB6avMkU2jFfqHW33",
        },
    },
    database: {
        mongoUri: process.env.BUILD_TYPE == "production" ? "mongodb://10.69.69.201:27017/fno" : "mongodb://10.69.69.201:27017/fnoDev",
    },
}
exports["default"] = config
