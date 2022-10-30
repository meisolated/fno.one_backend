//@ts-nocheck
const helper = require("./helper")

class Udp {
    static unPackUDP(resp, symbol, token) {
        let fyersDict = helper.getGlobalFiresDict
        var _globalData = []

        var FY_P_VAL_KEY = "v"
        var FY_P_DATA_KEY = "d"
        var FY_P_MIN_KEY = "cmd"
        var FY_P_STATUS = "s"
        var that = this
        try {
            var data_array_buffer = resp.data
            var count = data_array_buffer.byteLength
            var dictInfo = {}
            dictInfo[FY_P_STATUS] = "ok"
            dictInfo[FY_P_DATA_KEY] = {}
            dictInfo[FY_P_DATA_KEY]["7202"] = []
            dictInfo[FY_P_DATA_KEY]["7208"] = []
            dictInfo[FY_P_DATA_KEY]["31038"] = []
            var a = 0
            var dataCount = 0
            while (count > 0) {
                if (a >= 50) {
                    // console.log("break");
                    break
                }
                a += 1
                var header = new DataView(data_array_buffer, 0, 24)
                var cmn_data = ""
                var dataDict = {}
                // console.log("unPackUDP 3");
                var token = parseInt(header.getBigUint64(0))
                var fyCode = parseInt(header.getInt16(12))

                if (fyCode == 7202) {
                    if (token in fyersDict) {
                        cmn_data = new DataView(data_array_buffer, 24, 32)
                        var oi = parseInt(cmn_data.getInt32(0))
                        var pdoi = parseInt(cmn_data.getInt32(4))
                        var changeInOI = Number(oi - pdoi)
                        var percentChangeInOI = 0.0
                        if (pdoi == 0.0) {
                            percentChangeInOI = 0.0
                        } else {
                            percentChangeInOI = (changeInOI / pdoi) * 100
                        }
                        dataDict[FY_P_STATUS] = "ok"
                        dataDict[FY_P_VAL_KEY] = {}
                        dataDict[FY_P_VAL_KEY].oi = oi
                        dataDict[FY_P_VAL_KEY].pdoi = changeInOI
                        dataDict[FY_P_VAL_KEY].percentoi = percentChangeInOI.toFixed(2) + "%"
                        dataDict.n = fyersDict[token]
                        dataDict.fy = token
                        dataDict.fycode = fyCode
                        dictInfo[FY_P_DATA_KEY]["7202"].push(dataDict)
                        dataCount = 32
                        count = count - dataCount
                        data_array_buffer = data_array_buffer.slice(dataCount)
                    } else {
                        throw "Token " + token + " mapping not found"
                    }
                } else if (fyCode == 31038) {
                    cmn_data = new DataView(data_array_buffer, 24, 88)
                    var price_conv = parseFloat(cmn_data.getInt32(0))
                    var ltp = parseFloat(parseInt(cmn_data.getInt32(4)) / price_conv)

                    var symbol_ticker = ""
                    if (token in fyersDict) {
                        symbol_ticker = fyersDict[token].split(":")
                        dataDict[FY_P_STATUS] = "ok"
                        dataDict[FY_P_VAL_KEY] = {}
                        dataDict[FY_P_VAL_KEY].high_price = (
                            parseInt(cmn_data.getInt32(12)) / price_conv
                        ).toString()
                        dataDict[FY_P_VAL_KEY].prev_close_price = parseFloat(
                            parseInt(cmn_data.getInt32(20)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY].ch = Number(
                            parseFloat(ltp - dataDict[FY_P_VAL_KEY].prev_close_price).toFixed(2)
                        )
                        dataDict[FY_P_VAL_KEY].tt = parseInt(header.getInt32(8)) // Timestamp sent by exchange
                        dataDict[FY_P_VAL_KEY].description = fyersDict[token]
                        dataDict[FY_P_VAL_KEY].short_name = symbol_ticker[1] //temp_value
                        dataDict[FY_P_VAL_KEY].exchange = symbol_ticker[0]
                        dataDict[FY_P_VAL_KEY].low_price = parseFloat(
                            parseInt(cmn_data.getInt32(16)) / price_conv
                        )
                        // dataDict[FY_P_VAL_KEY].trans_code = fyCode;
                        dataDict[FY_P_VAL_KEY].oi = parseInt(cmn_data.getBigUint64(48))
                        var pdoi = parseInt(cmn_data.getBigUint64(56))
                        var changeOI = Number(dataDict[FY_P_VAL_KEY].oi - pdoi)
                        dataDict[FY_P_VAL_KEY].diffoi = changeOI
                        var percentChangeInOI = 0.0
                        if (pdoi == 0) {
                            percentChangeInOI = 0.0
                        } else {
                            percentChangeInOI = (changeOI / pdoi) * 100
                        }

                        dataDict[FY_P_VAL_KEY].percentoi = percentChangeInOI.toFixed(2) + "%"
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY] = {}
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].c = parseFloat(
                            parseInt(cmn_data.getInt32(36)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].h = parseFloat(
                            parseInt(cmn_data.getInt32(28)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].l = parseFloat(
                            parseInt(cmn_data.getInt32(32)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].o = parseFloat(
                            parseInt(cmn_data.getInt32(24)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].t =
                            parseInt(header.getInt32(8)) - (parseInt(header.getInt32(8)) % 60) // LTT
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].v = parseInt(cmn_data.getBigUint64(40))

                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].tf = ""
                        dataDict[FY_P_VAL_KEY].original_name = fyersDict[token]
                        dataDict[FY_P_VAL_KEY].chp = Number(
                            parseFloat(
                                ((ltp - dataDict[FY_P_VAL_KEY].prev_close_price) /
                                    dataDict[FY_P_VAL_KEY].prev_close_price) *
                                    100
                            ).toFixed(2)
                        ) // Percent change
                        dataDict[FY_P_VAL_KEY].open_price = parseFloat(
                            parseInt(cmn_data.getInt32(8)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY].lp = ltp // LTP

                        dataDict[FY_P_VAL_KEY].symbol = fyersDict[token]
                        dataCount = 88

                        var L2 = header.getInt8(18)
                        var additional = new DataView(data_array_buffer, 88, 120 - 88)
                        dataCount = 120
                        dataDict[FY_P_VAL_KEY].LTQ = parseFloat(additional.getInt32(0))
                        dataDict[FY_P_VAL_KEY].L2_LTT = parseInt(additional.getInt32(4))
                        dataDict[FY_P_VAL_KEY].ATP = parseFloat(
                            parseInt(additional.getInt32(8)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY].volume = parseInt(additional.getInt32(12))
                        dataDict[FY_P_VAL_KEY].tot_buy = parseFloat(additional.getBigUint64(16))
                        dataDict[FY_P_VAL_KEY].tot_sell = parseFloat(additional.getBigUint64(24))
                        if (L2 == "1") {
                            // console.log("unPackUDP 7");
                            var bid = new DataView(data_array_buffer, 120, 60)
                            var ask = new DataView(data_array_buffer, 180, 60)
                            var bidList = []
                            var askList = []
                            var totBuy = dataDict[FY_P_VAL_KEY].tot_buy
                            var totSell = dataDict[FY_P_VAL_KEY].tot_sell
                            //New change 2019-0709 Palash
                            for (var i = 0; i < 5; i++) {
                                bidList.push({
                                    volume: parseInt(bid.getInt32(i * 12 + 4)),
                                    price: parseFloat(parseInt(bid.getInt32(i * 12)) / price_conv),
                                    ord: parseInt(bid.getInt32(i * 12 + 8)),
                                })
                                askList.push({
                                    volume: parseInt(ask.getInt32(i * 12 + 4)),
                                    price: parseFloat(parseInt(ask.getInt32(i * 12)) / price_conv),
                                    ord: parseInt(ask.getInt32(i * 12 + 8)),
                                })
                            }
                            dataCount = 240
                            dataDict[FY_P_VAL_KEY].bid = bidList[0].price
                            dataDict[FY_P_VAL_KEY].ask = askList[0].price
                            var bidList_asc = bidList.reverse()
                            var depth = {
                                bids: bidList_asc,
                                asks: askList,
                                snapshot: true,
                                totSell: totSell,
                                totBuy: totBuy,
                            }
                            // console.log(depth);
                        } else {
                            var bid_ask = new DataView(data_array_buffer, 120, 8)
                            dataDict[FY_P_VAL_KEY].bid = parseFloat(
                                parseInt(bid_ask.getInt32(0)) / price_conv
                            )
                            dataDict[FY_P_VAL_KEY].ask = parseFloat(
                                parseInt(bid_ask.getInt32(4)) / price_conv
                            )
                            dataCount = 128
                        }

                        dataDict[FY_P_VAL_KEY].spread =
                            parseFloat(dataDict[FY_P_VAL_KEY].ask) -
                            parseFloat(dataDict[FY_P_VAL_KEY].bid)
                        dataDict[FY_P_VAL_KEY].marketStat = parseInt(header.getInt16(14))
                        dataDict.n = fyersDict[token]
                        dataDict.fy = token
                        dataDict.fycode = fyCode
                        dictInfo[FY_P_DATA_KEY]["31038"].push(dataDict)
                        count = count - dataCount
                        data_array_buffer = data_array_buffer.slice(dataCount)
                    } else {
                        throw "Token " + token + " mapping not found"
                    }
                } else if (fyCode != 7202 && fyCode != 31038) {
                    cmn_data = new DataView(data_array_buffer, 24, 72 - 24)
                    var price_conv = parseFloat(cmn_data.getInt32(0)) // 4bytes
                    var ltp = parseFloat(parseInt(cmn_data.getInt32(4)) / price_conv)

                    var symbol_ticker = ""
                    if (token in fyersDict) {
                        symbol_ticker = fyersDict[token].split(":")
                        dataDict[FY_P_STATUS] = "ok"
                        dataDict[FY_P_VAL_KEY] = {}
                        dataDict[FY_P_VAL_KEY].high_price = (
                            parseInt(cmn_data.getInt32(12)) / price_conv
                        ).toString()
                        dataDict[FY_P_VAL_KEY].prev_close_price = parseFloat(
                            parseInt(cmn_data.getInt32(20)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY].ch = Number(
                            parseFloat(ltp - dataDict[FY_P_VAL_KEY].prev_close_price).toFixed(2)
                        ) // Previous change
                        dataDict[FY_P_VAL_KEY].tt = parseInt(header.getInt32(8)) // Timestamp sent by exchange
                        dataDict[FY_P_VAL_KEY].description = fyersDict[token]
                        dataDict[FY_P_VAL_KEY].short_name = symbol_ticker[1] //temp_value
                        dataDict[FY_P_VAL_KEY].exchange = symbol_ticker[0]
                        dataDict[FY_P_VAL_KEY].low_price = parseFloat(
                            parseInt(cmn_data.getInt32(16)) / price_conv
                        )
                        // dataDict[FY_P_VAL_KEY].trans_code = fyCode;
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY] = {}
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].c = parseFloat(
                            parseInt(cmn_data.getInt32(36)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].h = parseFloat(
                            parseInt(cmn_data.getInt32(28)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].l = parseFloat(
                            parseInt(cmn_data.getInt32(32)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].o = parseFloat(
                            parseInt(cmn_data.getInt32(24)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].t =
                            parseInt(header.getInt32(8)) - (parseInt(header.getInt32(8)) % 60) // LTT
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].v = parseInt(cmn_data.getBigUint64(40))
                        dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].tf = ""
                        dataDict[FY_P_VAL_KEY].original_name = fyersDict[token]
                        dataDict[FY_P_VAL_KEY].chp = Number(
                            parseFloat(
                                ((ltp - dataDict[FY_P_VAL_KEY].prev_close_price) /
                                    dataDict[FY_P_VAL_KEY].prev_close_price) *
                                    100
                            ).toFixed(2)
                        ) // Percent change
                        dataDict[FY_P_VAL_KEY].open_price = parseFloat(
                            parseInt(cmn_data.getInt32(8)) / price_conv
                        )
                        dataDict[FY_P_VAL_KEY].lp = ltp // LTP

                        dataDict[FY_P_VAL_KEY].symbol = fyersDict[token]
                        dataCount = 72
                        if (fyCode == 7208) {
                            var L2 = header.getInt8(18)
                            var additional = new DataView(data_array_buffer, 72, 104 - 72)
                            dataCount = 104
                            dataDict[FY_P_VAL_KEY].LTQ = parseFloat(additional.getInt32(0))
                            dataDict[FY_P_VAL_KEY].L2_LTT = parseInt(additional.getInt32(4))
                            dataDict[FY_P_VAL_KEY].ATP = parseFloat(
                                parseInt(additional.getInt32(8)) / price_conv
                            )
                            dataDict[FY_P_VAL_KEY].volume = parseInt(additional.getInt32(12))
                            dataDict[FY_P_VAL_KEY].tot_buy = parseFloat(additional.getBigUint64(16))
                            dataDict[FY_P_VAL_KEY].tot_sell = parseFloat(
                                additional.getBigUint64(24)
                            )
                            if (L2 == 1) {
                                // console.log("unPackUDP 7");
                                var bid = new DataView(data_array_buffer, 104, 164 - 104)
                                var ask = new DataView(data_array_buffer, 164, 224 - 164)
                                var bidList = []
                                var askList = []
                                var totBuy = dataDict[FY_P_VAL_KEY].tot_buy
                                var totSell = dataDict[FY_P_VAL_KEY].tot_sell
                                //New change 2019-0709 Palash
                                for (var i = 0; i < 5; i++) {
                                    bidList.push({
                                        volume: parseInt(bid.getInt32(i * 12 + 4)),
                                        price: parseFloat(
                                            parseInt(bid.getInt32(i * 12)) / price_conv
                                        ),
                                        ord: parseInt(bid.getInt32(i * 12 + 8)),
                                    })
                                    askList.push({
                                        volume: parseInt(ask.getInt32(i * 12 + 4)),
                                        price: parseFloat(
                                            parseInt(ask.getInt32(i * 12)) / price_conv
                                        ),
                                        ord: parseInt(ask.getInt32(i * 12 + 8)),
                                    })
                                }
                                dataCount = 224
                                dataDict[FY_P_VAL_KEY].bid = bidList[0].price
                                dataDict[FY_P_VAL_KEY].ask = askList[0].price
                                var bidList_asc = bidList.reverse()
                                var depth = {
                                    bids: bidList_asc,
                                    asks: askList,
                                    snapshot: true,
                                    totSell: totSell,
                                    totBuy: totBuy,
                                }
                            } else {
                                var bid_ask = new DataView(data_array_buffer, 104, 8)
                                dataDict[FY_P_VAL_KEY].bid = parseFloat(
                                    parseInt(bid_ask.getInt32(0)) / price_conv
                                )
                                dataDict[FY_P_VAL_KEY].ask = parseFloat(
                                    parseInt(bid_ask.getInt32(4)) / price_conv
                                )
                                dataCount = 112
                            }
                        } else {
                            dataDict[FY_P_VAL_KEY].bid = ltp
                            dataDict[FY_P_VAL_KEY].ask = ltp
                        }
                        dataDict[FY_P_VAL_KEY].spread =
                            parseFloat(dataDict[FY_P_VAL_KEY].ask) -
                            parseFloat(dataDict[FY_P_VAL_KEY].bid)
                        dataDict[FY_P_VAL_KEY].marketStat = parseInt(header.getInt16(14))
                        dataDict.n = fyersDict[token]
                        dataDict.fy = token
                        dataDict.fycode = fyCode

                        dictInfo[FY_P_DATA_KEY]["7208"].push(dataDict)

                        count = count - dataCount
                        data_array_buffer = data_array_buffer.slice(dataCount)
                    } else {
                        throw "Token " + token + " mapping not found"
                    }
                }
            } // within while loop (end of while loop)
            // console.log(dictInfo);
            return dictInfo // return statement
        } catch (err) {
            var dictInfo = {}
            dictInfo[FY_P_STATUS] = "err"
            dictInfo[FY_P_DATA_KEY] = [err]

            return dictInfo
        }
    }
}

module.exports = Udp
