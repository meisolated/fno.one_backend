//@ts-nocheck
import axios from 'axios';
import WebSocket from 'ws';
import config from '../../config';
import logger from '../../logger';
const api = 'https://api.fyers.in/api/v2/';
const dataApi = 'https://api.fyers.in/data-rest/v2/';
const WS_URL = (appId: string, token: string, update: string) => `wss://api.fyers.in/socket/v2/dataSock?access_token=${appId}:${token}&user-agent=fyers-api&type=${update}`;
const generateAccessTokenUrl = (authToken: string, appId: string) => api + 'genrateToken?authorization_code=' + authToken.authorization_code + '&app_id=' + appId;
var _globalFyersDict: any = {};

// ------| Helper functions |------
async function sha256(s: any) {
    var chrsz = 8;
    var hexcase = 0;
    function safe_add(x, y) {
        var lsw = (x & 0xffff) + (y & 0xffff);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    }
    function S(X, n) {
        return (X >>> n) | (X << (32 - n));
    }
    function R(X, n) {
        return X >>> n;
    }
    function Ch(x, y, z) {
        return (x & y) ^ (~x & z);
    }
    function Maj(x, y, z) {
        return (x & y) ^ (x & z) ^ (y & z);
    }
    function Sigma0256(x) {
        return S(x, 2) ^ S(x, 13) ^ S(x, 22);
    }
    function Sigma1256(x) {
        return S(x, 6) ^ S(x, 11) ^ S(x, 25);
    }
    function Gamma0256(x) {
        return S(x, 7) ^ S(x, 18) ^ R(x, 3);
    }
    function Gamma1256(x) {
        return S(x, 17) ^ S(x, 19) ^ R(x, 10);
    }
    function core_sha256(m, l) {
        var K = new Array(
            0x428a2f98,
            0x71374491,
            0xb5c0fbcf,
            0xe9b5dba5,
            0x3956c25b,
            0x59f111f1,
            0x923f82a4,
            0xab1c5ed5,
            0xd807aa98,
            0x12835b01,
            0x243185be,
            0x550c7dc3,
            0x72be5d74,
            0x80deb1fe,
            0x9bdc06a7,
            0xc19bf174,
            0xe49b69c1,
            0xefbe4786,
            0xfc19dc6,
            0x240ca1cc,
            0x2de92c6f,
            0x4a7484aa,
            0x5cb0a9dc,
            0x76f988da,
            0x983e5152,
            0xa831c66d,
            0xb00327c8,
            0xbf597fc7,
            0xc6e00bf3,
            0xd5a79147,
            0x6ca6351,
            0x14292967,
            0x27b70a85,
            0x2e1b2138,
            0x4d2c6dfc,
            0x53380d13,
            0x650a7354,
            0x766a0abb,
            0x81c2c92e,
            0x92722c85,
            0xa2bfe8a1,
            0xa81a664b,
            0xc24b8b70,
            0xc76c51a3,
            0xd192e819,
            0xd6990624,
            0xf40e3585,
            0x106aa070,
            0x19a4c116,
            0x1e376c08,
            0x2748774c,
            0x34b0bcb5,
            0x391c0cb3,
            0x4ed8aa4a,
            0x5b9cca4f,
            0x682e6ff3,
            0x748f82ee,
            0x78a5636f,
            0x84c87814,
            0x8cc70208,
            0x90befffa,
            0xa4506ceb,
            0xbef9a3f7,
            0xc67178f2,
        );
        var HASH = new Array(0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19);
        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;
        m[l >> 5] |= 0x80 << (24 - (l % 32));
        m[(((l + 64) >> 9) << 4) + 15] = l;
        for (var i = 0; i < m.length; i += 16) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];
            for (var j = 0; j < 64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }
            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }
    function str2binb(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - (i % 32));
        }
        return bin;
    }
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
    function binb2hex(binarray) {
        var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
        var str = '';
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8 + 4)) & 0xf) + hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xf);
        }
        return str;
    }
    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}
async function socketWrapper(url: string, data: string, callback: Function, user?: string) {
    const pingFrequency = 6000;
    const maxReconnectTimes = 10;
    let isAlive = false;
    let reconnectCount = 0;

    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    ws.on('open', () => {
        logger.info('a socket connection is established', user ? true : false, user ? user : 'null');
        ws.send(data);
        ws.send(JSON.stringify('ping'));
    });
    ws.on('error', (e) => {
        logger.error(e.message, user ? true : false, user ? user : 'null');
    });
    ws.on('closed', (e) => {
        logger.error(e.message, user ? true : false, user ? user : 'null');
    });
    ws.onmessage = (res) => {
        if (typeof res.data === 'string' && res.data.includes('pong')) {
            isAlive = true;
            return;
        } else {
            callback(res);
        }
    };
    let interValInstant = setInterval(() => {
        if (!isAlive) {
            logger.warn('trying to reconnect', user ? true : false, user ? user : 'null');
            reconnectCount++;
            clearInterval(interValInstant);
            if (reconnectCount <= maxReconnectTimes) {
                socketWrapper(url, data, callback, user);
            } else {
                logger.warn('Error : Connection Error unable to connect to socket', user ? true : false, user ? user : 'null');
            }
        }
    }, pingFrequency);
    return ws;
}
function unPackUDP(resp: any) {
    var FY_P_VAL_KEY = 'v';
    var FY_P_DATA_KEY = 'd';
    var FY_P_MIN_KEY = 'cmd';
    var FY_P_STATUS = 's';
    try {
        var data_array_buffer = resp.data;
        var count = data_array_buffer.byteLength;
        var dictInfo: any = {};
        dictInfo[FY_P_STATUS] = 'ok';
        dictInfo[FY_P_DATA_KEY] = {};
        dictInfo[FY_P_DATA_KEY]['7202'] = [];
        dictInfo[FY_P_DATA_KEY]['7208'] = [];
        dictInfo[FY_P_DATA_KEY]['31038'] = [];
        var a = 0;
        var dataCount = 0;
        while (count > 0) {
            if (a >= 50) {
                // console.log("break");
                break;
            }
            a += 1;
            var header: any = new DataView(data_array_buffer, 0, 24);
            var cmn_data: any = null;
            var dataDict: any = {};
            // console.log("unPackUDP 3");
            var token = parseInt(header.getBigUint64(0));
            var fyCode = parseInt(header.getInt16(12));

            if (fyCode == 7202) {
                if (token in _globalFyersDict) {
                    cmn_data = new DataView(data_array_buffer, 24, 32);
                    var oi = parseInt(cmn_data.getInt32(0));
                    var pdoi = parseInt(cmn_data.getInt32(4));
                    var changeInOI = Number(oi - pdoi);
                    var percentChangeInOI = 0.0;
                    if (pdoi == 0.0) {
                        percentChangeInOI = 0.0;
                    } else {
                        percentChangeInOI = (changeInOI / pdoi) * 100;
                    }
                    dataDict[FY_P_STATUS] = 'ok';
                    dataDict[FY_P_VAL_KEY] = {};
                    dataDict[FY_P_VAL_KEY].oi = oi;
                    dataDict[FY_P_VAL_KEY].pdoi = changeInOI;
                    dataDict[FY_P_VAL_KEY].percentoi = percentChangeInOI.toFixed(2) + '%';
                    dataDict.n = _globalFyersDict[token];
                    dataDict.fy = token;
                    dataDict.fycode = fyCode;
                    dictInfo[FY_P_DATA_KEY]['7202'].push(dataDict);
                    dataCount = 32;
                    count = count - dataCount;
                    data_array_buffer = data_array_buffer.slice(dataCount);
                } else {
                    throw 'Token ' + token + ' mapping not found - 1';
                }
            } else if (fyCode == 31038) {
                cmn_data = new DataView(data_array_buffer, 24, 88);
                var price_conv = parseFloat(cmn_data.getInt32(0));
                //@ts-ignore
                var ltp = parseFloat(parseInt(cmn_data.getInt32(4)) / price_conv);

                var symbol_ticker = '';
                if (token in _globalFyersDict) {
                    symbol_ticker = _globalFyersDict[token].split(':');
                    dataDict[FY_P_STATUS] = 'ok';
                    dataDict[FY_P_VAL_KEY] = {};
                    dataDict[FY_P_VAL_KEY].high_price = (parseInt(cmn_data.getInt32(12)) / price_conv).toString();
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].prev_close_price = parseFloat(parseInt(cmn_data.getInt32(20)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].ch = Number(parseFloat(ltp - dataDict[FY_P_VAL_KEY].prev_close_price).toFixed(2));
                    dataDict[FY_P_VAL_KEY].tt = parseInt(header.getInt32(8)); // Timestamp sent by exchange
                    dataDict[FY_P_VAL_KEY].description = _globalFyersDict[token];
                    dataDict[FY_P_VAL_KEY].short_name = symbol_ticker[1]; //temp_value
                    dataDict[FY_P_VAL_KEY].exchange = symbol_ticker[0];
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].low_price = parseFloat(parseInt(cmn_data.getInt32(16)) / price_conv);
                    // dataDict[FY_P_VAL_KEY].trans_code = fyCode;
                    dataDict[FY_P_VAL_KEY].oi = parseInt(cmn_data.getBigUint64(48));
                    var pdoi = parseInt(cmn_data.getBigUint64(56));
                    var changeOI = Number(dataDict[FY_P_VAL_KEY].oi - pdoi);
                    dataDict[FY_P_VAL_KEY].diffoi = changeOI;
                    var percentChangeInOI = 0.0;
                    if (pdoi == 0) {
                        percentChangeInOI = 0.0;
                    } else {
                        percentChangeInOI = (changeOI / pdoi) * 100;
                    }

                    dataDict[FY_P_VAL_KEY].percentoi = percentChangeInOI.toFixed(2) + '%';
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY] = {};
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].c = parseFloat(parseInt(cmn_data.getInt32(36)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].h = parseFloat(parseInt(cmn_data.getInt32(28)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].l = parseFloat(parseInt(cmn_data.getInt32(32)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].o = parseFloat(parseInt(cmn_data.getInt32(24)) / price_conv);
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].t = parseInt(header.getInt32(8)) - (parseInt(header.getInt32(8)) % 60); // LTT
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].v = parseInt(cmn_data.getBigUint64(40));

                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].tf = '';
                    dataDict[FY_P_VAL_KEY].original_name = _globalFyersDict[token];
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].chp = Number(parseFloat(((ltp - dataDict[FY_P_VAL_KEY].prev_close_price) / dataDict[FY_P_VAL_KEY].prev_close_price) * 100).toFixed(2)); // Percent change
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].open_price = parseFloat(parseInt(cmn_data.getInt32(8)) / price_conv);
                    dataDict[FY_P_VAL_KEY].lp = ltp; // LTP

                    dataDict[FY_P_VAL_KEY].symbol = _globalFyersDict[token];
                    dataCount = 88;

                    var L2 = header.getInt8(18);
                    var additional: any = new DataView(data_array_buffer, 88, 120 - 88);
                    dataCount = 120;
                    dataDict[FY_P_VAL_KEY].LTQ = parseFloat(additional.getInt32(0));
                    dataDict[FY_P_VAL_KEY].L2_LTT = parseInt(additional.getInt32(4));
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].ATP = parseFloat(parseInt(additional.getInt32(8)) / price_conv);
                    dataDict[FY_P_VAL_KEY].volume = parseInt(additional.getInt32(12));
                    dataDict[FY_P_VAL_KEY].tot_buy = parseFloat(additional.getBigUint64(16));
                    dataDict[FY_P_VAL_KEY].tot_sell = parseFloat(additional.getBigUint64(24));
                    if (L2 == '1') {
                        // console.log("unPackUDP 7");
                        var bid = new DataView(data_array_buffer, 120, 60);
                        var ask = new DataView(data_array_buffer, 180, 60);
                        var bidList = [];
                        var askList = [];
                        var totBuy = dataDict[FY_P_VAL_KEY].tot_buy;
                        var totSell = dataDict[FY_P_VAL_KEY].tot_sell;
                        //New change 2019-0709 Palash
                        for (var i = 0; i < 5; i++) {
                            //@ts-ignore
                            bidList.push({
                                volume: parseInt(bid.getInt32(i * 12 + 4)),
                                price: parseFloat(parseInt(bid.getInt32(i * 12)) / price_conv),
                                ord: parseInt(bid.getInt32(i * 12 + 8)),
                            });
                            //@ts-ignore
                            askList.push({
                                volume: parseInt(ask.getInt32(i * 12 + 4)),
                                price: parseFloat(parseInt(ask.getInt32(i * 12)) / price_conv),
                                ord: parseInt(ask.getInt32(i * 12 + 8)),
                            });
                        }
                        dataCount = 240;
                        dataDict[FY_P_VAL_KEY].bid = bidList[0].price;
                        dataDict[FY_P_VAL_KEY].ask = askList[0].price;
                        var bidList_asc = bidList.reverse();
                        var depth = {
                            bids: bidList_asc,
                            asks: askList,
                            snapshot: true,
                            totSell: totSell,
                            totBuy: totBuy,
                        };
                        // console.log(depth);
                    } else {
                        var bid_ask = new DataView(data_array_buffer, 120, 8);
                        //@ts-ignore
                        dataDict[FY_P_VAL_KEY].bid = parseFloat(parseInt(bid_ask.getInt32(0)) / price_conv);
                        //@ts-ignore
                        dataDict[FY_P_VAL_KEY].ask = parseFloat(parseInt(bid_ask.getInt32(4)) / price_conv);
                        dataCount = 128;
                    }

                    dataDict[FY_P_VAL_KEY].spread = parseFloat(dataDict[FY_P_VAL_KEY].ask) - parseFloat(dataDict[FY_P_VAL_KEY].bid);
                    dataDict[FY_P_VAL_KEY].marketStat = parseInt(header.getInt16(14));
                    dataDict.n = _globalFyersDict[token];
                    dataDict.fy = token;
                    dataDict.fycode = fyCode;
                    dictInfo[FY_P_DATA_KEY]['31038'].push(dataDict);
                    count = count - dataCount;
                    data_array_buffer = data_array_buffer.slice(dataCount);
                } else {
                    throw 'Token ' + token + ' mapping not found - 2';
                }
            } else if (fyCode != 7202 && fyCode != 31038) {
                cmn_data = new DataView(data_array_buffer, 24, 72 - 24);
                var price_conv = parseFloat(cmn_data.getInt32(0)); // 4bytes
                //@ts-ignore
                var ltp = parseFloat(parseInt(cmn_data.getInt32(4)) / price_conv);

                var symbol_ticker = '';
                if (token in _globalFyersDict) {
                    symbol_ticker = _globalFyersDict[token].split(':');
                    dataDict[FY_P_STATUS] = 'ok';
                    dataDict[FY_P_VAL_KEY] = {};
                    dataDict[FY_P_VAL_KEY].high_price = (parseInt(cmn_data.getInt32(12)) / price_conv).toString();
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].prev_close_price = parseFloat(parseInt(cmn_data.getInt32(20)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].ch = Number(parseFloat(ltp - dataDict[FY_P_VAL_KEY].prev_close_price).toFixed(2)); // Previous change
                    dataDict[FY_P_VAL_KEY].tt = parseInt(header.getInt32(8)); // Timestamp sent by exchange
                    dataDict[FY_P_VAL_KEY].description = _globalFyersDict[token];
                    dataDict[FY_P_VAL_KEY].short_name = symbol_ticker[1]; //temp_value
                    dataDict[FY_P_VAL_KEY].exchange = symbol_ticker[0];
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].low_price = parseFloat(parseInt(cmn_data.getInt32(16)) / price_conv);
                    // dataDict[FY_P_VAL_KEY].trans_code = fyCode;
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY] = {};
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].c = parseFloat(parseInt(cmn_data.getInt32(36)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].h = parseFloat(parseInt(cmn_data.getInt32(28)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].l = parseFloat(parseInt(cmn_data.getInt32(32)) / price_conv);
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].o = parseFloat(parseInt(cmn_data.getInt32(24)) / price_conv);
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].t = parseInt(header.getInt32(8)) - (parseInt(header.getInt32(8)) % 60); // LTT
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].v = parseInt(cmn_data.getBigUint64(40));
                    dataDict[FY_P_VAL_KEY][FY_P_MIN_KEY].tf = '';
                    dataDict[FY_P_VAL_KEY].original_name = _globalFyersDict[token];
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].chp = Number(parseFloat(((ltp - dataDict[FY_P_VAL_KEY].prev_close_price) / dataDict[FY_P_VAL_KEY].prev_close_price) * 100).toFixed(2)); // Percent change
                    //@ts-ignore
                    dataDict[FY_P_VAL_KEY].open_price = parseFloat(parseInt(cmn_data.getInt32(8)) / price_conv);
                    dataDict[FY_P_VAL_KEY].lp = ltp; // LTP

                    dataDict[FY_P_VAL_KEY].symbol = _globalFyersDict[token];
                    dataCount = 72;
                    if (fyCode == 7208) {
                        var L2 = header.getInt8(18);
                        var additional: any = new DataView(data_array_buffer, 72, 104 - 72);
                        dataCount = 104;
                        dataDict[FY_P_VAL_KEY].LTQ = parseFloat(additional.getInt32(0));
                        dataDict[FY_P_VAL_KEY].L2_LTT = parseInt(additional.getInt32(4));
                        //@ts-ignore
                        dataDict[FY_P_VAL_KEY].ATP = parseFloat(parseInt(additional.getInt32(8)) / price_conv);
                        dataDict[FY_P_VAL_KEY].volume = parseInt(additional.getInt32(12));
                        dataDict[FY_P_VAL_KEY].tot_buy = parseFloat(additional.getBigUint64(16));
                        dataDict[FY_P_VAL_KEY].tot_sell = parseFloat(additional.getBigUint64(24));
                        if (L2 == 1) {
                            // console.log("unPackUDP 7");
                            var bid = new DataView(data_array_buffer, 104, 164 - 104);
                            var ask = new DataView(data_array_buffer, 164, 224 - 164);
                            var bidList = [];
                            var askList = [];
                            var totBuy = dataDict[FY_P_VAL_KEY].tot_buy;
                            var totSell = dataDict[FY_P_VAL_KEY].tot_sell;
                            //New change 2019-0709 Palash
                            for (var i = 0; i < 5; i++) {
                                //@ts-ignore
                                bidList.push({
                                    volume: parseInt(bid.getInt32(i * 12 + 4)),
                                    price: parseFloat(parseInt(bid.getInt32(i * 12)) / price_conv),
                                    ord: parseInt(bid.getInt32(i * 12 + 8)),
                                });
                                //@ts-ignore
                                askList.push({
                                    volume: parseInt(ask.getInt32(i * 12 + 4)),
                                    price: parseFloat(parseInt(ask.getInt32(i * 12)) / price_conv),
                                    ord: parseInt(ask.getInt32(i * 12 + 8)),
                                });
                            }
                            dataCount = 224;
                            dataDict[FY_P_VAL_KEY].bid = bidList[0].price;
                            dataDict[FY_P_VAL_KEY].ask = askList[0].price;
                            var bidList_asc = bidList.reverse();
                            var depth = {
                                bids: bidList_asc,
                                asks: askList,
                                snapshot: true,
                                totSell: totSell,
                                totBuy: totBuy,
                            };
                        } else {
                            var bid_ask = new DataView(data_array_buffer, 104, 8);
                            //@ts-ignore
                            dataDict[FY_P_VAL_KEY].bid = parseFloat(parseInt(bid_ask.getInt32(0)) / price_conv);
                            //@ts-ignore
                            dataDict[FY_P_VAL_KEY].ask = parseFloat(parseInt(bid_ask.getInt32(4)) / price_conv);
                            dataCount = 112;
                        }
                    } else {
                        dataDict[FY_P_VAL_KEY].bid = ltp;
                        dataDict[FY_P_VAL_KEY].ask = ltp;
                    }
                    dataDict[FY_P_VAL_KEY].spread = parseFloat(dataDict[FY_P_VAL_KEY].ask) - parseFloat(dataDict[FY_P_VAL_KEY].bid);
                    dataDict[FY_P_VAL_KEY].marketStat = parseInt(header.getInt16(14));
                    dataDict.n = _globalFyersDict[token];
                    dataDict.fy = token;
                    dataDict.fycode = fyCode;

                    dictInfo[FY_P_DATA_KEY]['7208'].push(dataDict);

                    count = count - dataCount;
                    data_array_buffer = data_array_buffer.slice(dataCount);
                } else {
                    throw 'Token ' + token + ' mapping not found - 3';
                }
            }
        } // within while loop (end of while loop)
        // console.log(dictInfo);
        return dictInfo; // return statement
    } catch (err) {
        var dictInfo: any = {};
        dictInfo[FY_P_STATUS] = 'err';
        dictInfo[FY_P_DATA_KEY] = [err];

        return dictInfo;
    }
}

// ------| Class to handle the data received from the websocket |------
class marketDataUpdateHelper {
    private marketDataUpdateInstance: any;
    private data = { T: 'SUB_DATA', TLIST: null, SUB_T: 1 };
    private connected = false;

    async onMarketDataUpdate(symbol: Array<string>, accessToken: string, callback: Function, user: string) {
        this.data.TLIST = symbol;
        await getQuotes(symbol, `${config.fyers.appId}:${accessToken}`);
        const dataString = JSON.stringify(this.data);
        const url = WS_URL(config.fyers.appId, accessToken, 'symbolUpdate');
        this.marketDataUpdateInstance = socketWrapper(
            url,
            dataString,
            async (data: any) => {
                if (!this.connected) {
                    this.connected = true;
                    return callback(data.data);
                }
                let unpackedData = unPackUDP(data);
                callback(unpackedData);
            },
            user,
        );
    }
    async unsubscribe() {
        if (this.marketDataUpdateInstance) {
            this.data.SUB_T = 0;
            const dataString = JSON.stringify(this.data);
            this.marketDataUpdateInstance.send(dataString);
            return true;
        } else {
            return false;
        }
    }
}
class orderUpdateHelper {
    private orderUpdateInstance: any;
    private data = { T: 'SUB_ORD', SLIST: ['orderUpdate'], SUB_T: 1 };

    async onOrderUpdate(accessToken: string, callback: Function, user: string) {
        const dataString = JSON.stringify(this.data);
        const url = WS_URL(config.fyers.appId, accessToken, 'orderUpdate');
        this.orderUpdateInstance = socketWrapper(
            url,
            dataString,
            (data: any) => {
                return callback(data.data);
            },
            user,
        );
    }
    async unsubscribe() {
        if (this.orderUpdateInstance) {
            this.data.SUB_T = 0;
            const dataString = JSON.stringify(this.data);
            this.orderUpdateInstance.send(dataString);
            return true;
        } else {
            return false;
        }
    }
}
const getQuotes = async (symbol: any, token: any) => {
    try {
        const quotes = await axios.get(`${api}quotes?symbols=${symbol.toString()}`, {
            headers: {
                Authorization: token,
            },
        });
        const result = quotes.data;

        if (result.d.length > 0) {
            for (var i = 0; i < result.d.length; i++) {
                _globalFyersDict[result.d[i].v.fyToken] = result.d[i].n;
            }
        }
        return quotes.data;
    } catch (e: any) {
        return e.response.data;
    }
};
export { marketDataUpdateHelper, orderUpdateHelper, sha256 };
