import axios from 'axios';

const appId = '6UL65YECYS-100';
const accessToken =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2ODg3OTI1OTIsImV4cCI6MTY4ODg2MjYxMiwibmJmIjoxNjg4NzkyNTkyLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCa3FPNFF0TktudjZmTE8wT2dBZXF5MDZsY2g3azZLWHlWd0M1NWMzclpuVVFxaHBfMmFQYlRYUkJFMnR3d25kV3ZQS2w3a2NHc1VJUXJVV2NWSURhTnk3S0tqNVZZLXpwd0hFUW8wTXFmWkd2Q1FrWT0iLCJkaXNwbGF5X25hbWUiOiJWSVZFSyBLVU1BUiBNVURHQUwiLCJvbXMiOiJLMSIsImZ5X2lkIjoiWFYxOTgxOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.rVVVjBnh-mGS3QcoDlestzl9_-CGVSJ7NkVTLP-gSyg';

const symbol = 'NSE:NIFTYBANK-INDEX';
const lastYearUnixTime = new Date().getTime() - 365 * 24 * 60 * 60 * 1000;
const resolution = '5';
const dateFormat = 0;

// Analyze the data
const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const lastOneYearMontlyTimestampGenerator = () => {
    const lastOneYearMontlyTimestamp = [];
    for (let i = 0; i < 12; i++) {
        const unix = Math.floor((lastYearUnixTime + i * 30 * 24 * 60 * 60 * 1000) / 1000);
        const date = new Date(unix);
        const trimmedDate = date.toISOString().split('T')[0];
        lastOneYearMontlyTimestamp.push(unix);
    }
    return lastOneYearMontlyTimestamp;
};
const monthOnMonth = lastOneYearMontlyTimestampGenerator();

const convertMonthOnMonthToPair = (monthOnMonth: number[]) => {
    const monthOnMonthPair = [];
    for (let i = 0; i < monthOnMonth.length - 1; i++) {
        monthOnMonthPair.push([monthOnMonth[i], monthOnMonth[i + 1]]);
    }
    return monthOnMonthPair;
};
const monthOnMonthPair = convertMonthOnMonthToPair(monthOnMonth);

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// setup settings
const maxSL = 100;
const targetRatio = 3;

// setup data

const SLArray: any = [];
const targetArray = [];
const tradesArray: any = [];
let yesterdayDate = '';
let currentMonth = '';
let lastCandleData = {
    open: 0,
    close: 0,
    high: 0,
    low: 0,
};
const candlePair = {
    high: 0,
    low: 0,
};
const activeTrade = {
    breakoutSide: 'nill',
    status: false,
    tradeActive: false,
    stoploss: 0,
    target: 0,
    entryPrice: 0,
    SLInPoints: 0,
};
let tradeDoneForTheDay = false;
let totalSL = 0;
let totalTarget = 0;
let pointsCaptured = 0;
let todayPointsCaptured = 0;
let totalPostiveDays = 0;
let totalNegativeDays = 0;
const monthOnMonthData: any = [];

async function asyncForEach(monthsUnixPair: Array<Array<number>>, callback: Function) {
    for (let index = 0; index < monthsUnixPair.length; index++) {
        var config = {
            method: 'get',
            url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${monthsUnixPair[index][0]}&range_to=${monthsUnixPair[index][1]}&cont_flag=`,
            // url: `https://api.fyers.in/data-rest/v2/history/?symbol=${symbol}&resolution=${resolution}&date_format=${dateFormat}&range_from=${from}&range_to=${to}&cont_flag=`,
            headers: {
                Authorization: appId + ':' + accessToken,
            },
        };

        await sleep(2000);
        const { data }: any = await axios(config).catch((error) => {
            console.log(error);
        });
        const candles: Array<[number]> = data.candles;
        candles.forEach((candle: Array<number>, index) => {
            const ts = candle[0];
            const open = candle[1];
            const high = candle[2];
            const low = candle[3];
            const close = candle[4];
            const volume = candle[5];
            const dt = new Date(ts * 1000);
            const day = dt.getDay();
            const thisCandleDate = new Date(ts * 1000).toISOString().split('T')[0];
            const currentCandleTime = new Date(ts * 1000).toISOString().split('T')[1];
            const crntMonth = new Date(ts * 1000).toISOString().split('-')[1];
            const crntYear = new Date(ts * 1000).toISOString().split('-')[0];

            if (activeTrade.tradeActive) {
                if (thisCandleDate != yesterdayDate && activeTrade.tradeActive == true) {
                    activeTrade.tradeActive = false;
                    activeTrade.status = false;
                    totalSL += 0;
                    totalNegativeDays += 0;
                    pointsCaptured -= 0;
                    todayPointsCaptured -= 0;
                }
                if (activeTrade.breakoutSide == 'up') {
                    if (low < activeTrade.stoploss) {
                        // console.log("stoploss hit")
                        activeTrade.tradeActive = false;
                        activeTrade.status = false;
                        totalSL += activeTrade.SLInPoints;
                        totalNegativeDays += 1;
                        pointsCaptured -= activeTrade.SLInPoints;
                        todayPointsCaptured -= activeTrade.SLInPoints;
                        tradesArray.push({
                            entryPrice: activeTrade.entryPrice,
                            stoploss: activeTrade.stoploss,
                            target: activeTrade.target,
                            status: 'SL',
                            points: activeTrade.SLInPoints,
                            date: yesterdayDate,
                            month: currentMonth,
                            year: crntYear,
                            day: day,
                        });
                        monthOnMonthData.push({
                            month: crntMonth + '-' + crntYear,
                            status: 'SL',
                            points: activeTrade.SLInPoints,
                        });
                    } else if (high > activeTrade.entryPrice + activeTrade.target) {
                        // console.log("target hit")
                        activeTrade.tradeActive = false;
                        activeTrade.status = false;
                        totalTarget += activeTrade.target;
                        totalPostiveDays += 1;
                        pointsCaptured += activeTrade.target;
                        todayPointsCaptured += activeTrade.target;
                        tradesArray.push({
                            entryPrice: activeTrade.entryPrice,
                            stoploss: activeTrade.stoploss,
                            target: activeTrade.target,
                            status: 'Target',
                            points: activeTrade.target,
                            date: yesterdayDate,
                            month: currentMonth,
                            year: crntYear,
                            day: day,
                        });
                        monthOnMonthData.push({
                            month: crntMonth + '-' + crntYear,
                            status: 'Target',
                            points: activeTrade.target,
                        });
                    }
                } else if (activeTrade.breakoutSide == 'down') {
                    if (high > activeTrade.stoploss) {
                        // console.log("stoploss hit")
                        activeTrade.tradeActive = false;
                        activeTrade.status = false;
                        totalSL += activeTrade.SLInPoints;
                        totalNegativeDays += 1;
                        pointsCaptured -= activeTrade.SLInPoints;
                        todayPointsCaptured -= activeTrade.SLInPoints;
                        tradesArray.push({
                            entryPrice: activeTrade.entryPrice,
                            stoploss: activeTrade.stoploss,
                            target: activeTrade.target,
                            status: 'SL',
                            points: activeTrade.SLInPoints,
                            date: yesterdayDate,
                            month: currentMonth,
                            year: crntYear,
                            day: day,
                        });
                        monthOnMonthData.push({
                            month: crntMonth + '-' + crntYear,
                            status: 'SL',
                            points: activeTrade.SLInPoints,
                        });
                    } else if (low < activeTrade.entryPrice - activeTrade.target) {
                        // console.log("target hit")
                        activeTrade.tradeActive = false;
                        activeTrade.status = false;
                        totalTarget += activeTrade.target;
                        totalPostiveDays += 1;
                        pointsCaptured += activeTrade.target;
                        todayPointsCaptured += activeTrade.target;
                        tradesArray.push({
                            entryPrice: activeTrade.entryPrice,
                            stoploss: activeTrade.stoploss,
                            target: activeTrade.target,
                            status: 'Target',
                            points: activeTrade.target,
                            date: yesterdayDate,
                            month: currentMonth,
                            year: crntYear,
                            day: day,
                        });
                        monthOnMonthData.push({
                            month: crntMonth + '-' + crntYear,
                            status: 'Target',
                            points: activeTrade.target,
                        });
                    }
                }
            }

            if (thisCandleDate == yesterdayDate && tradeDoneForTheDay == true) return;
            if (thisCandleDate != yesterdayDate) {
                tradeDoneForTheDay = false;
                yesterdayDate = thisCandleDate;
                candlePair.high = 0;
                candlePair.low = 0;
                activeTrade.breakoutSide = 'nill';
                activeTrade.status = false;
                activeTrade.tradeActive = false;
                activeTrade.stoploss = 0;
                activeTrade.target = 0;
                activeTrade.entryPrice = 0;
                activeTrade.SLInPoints = 0;
            }

            if (thisCandleDate == yesterdayDate && candlePair.high == 0 && candlePair.low == 0) {
                if (currentCandleTime == '03:45:00.000Z') return;
                // search for a red and green candle pair
                if (lastCandleData.close !== 0 && lastCandleData.open !== 0 && lastCandleData.close < lastCandleData.open && close > open) {
                    // console.log("green and red candle pair found")
                    candlePair.high = lastCandleData.high > high ? lastCandleData.high : high;
                    candlePair.low = lastCandleData.low < low ? lastCandleData.low : low;
                } else if (lastCandleData.close !== 0 && lastCandleData.open !== 0 && lastCandleData.close > lastCandleData.open && close < open) {
                    // console.log("red and green candle pair found")
                    candlePair.high = lastCandleData.high > high ? lastCandleData.high : high;
                    candlePair.low = lastCandleData.low < low ? lastCandleData.low : low;
                } else {
                    // console.log("no candle pair found")
                    lastCandleData = {
                        open: open,
                        close: close,
                        high: high,
                        low: low,
                    };
                }
            } else if (candlePair.high !== 0 && candlePair.low !== 0) {
                // we have a candle pair and we can start our analysis
                // if current candle breaks out of the candle pair then we will take a trade
                // if MaxSL is above 100 then we will not take the trade
                if (candlePair.high - candlePair.low > maxSL) {
                    candlePair.high = 0;
                    candlePair.low = 0;
                    return;
                } else {
                    if (high > candlePair.high) {
                        tradeDoneForTheDay = true;
                        activeTrade.breakoutSide = 'up';
                        activeTrade.status = true;
                        activeTrade.tradeActive = true;
                        activeTrade.stoploss = candlePair.low;
                        activeTrade.target = (candlePair.high - candlePair.low) * targetRatio;
                        activeTrade.entryPrice = candlePair.high;
                        activeTrade.SLInPoints = activeTrade.entryPrice - activeTrade.stoploss;
                        candlePair.high = 0;
                        candlePair.low = 0;
                        SLArray.push(activeTrade.SLInPoints);
                        targetArray.push(activeTrade.target);
                    } else if (low < candlePair.low) {
                        tradeDoneForTheDay = true;
                        activeTrade.breakoutSide = 'down';
                        activeTrade.status = true;
                        activeTrade.tradeActive = true;
                        activeTrade.stoploss = candlePair.high;
                        activeTrade.target = (candlePair.high - candlePair.low) * targetRatio;
                        activeTrade.entryPrice = candlePair.low;
                        activeTrade.SLInPoints = activeTrade.stoploss - activeTrade.entryPrice;
                        candlePair.high = 0;
                        candlePair.low = 0;
                        SLArray.push(activeTrade.SLInPoints);
                        targetArray.push(activeTrade.target);
                    }
                }
            }
        });
        await callback();
    }
}

asyncForEach(monthOnMonthPair, () => {
    // console.log(FirstCandleData)
    console.log('pointsCaptured', pointsCaptured);
    console.log('totalSL', totalSL);
    console.log('totalTarget', totalTarget);
    console.log('totalPostiveDays', totalPostiveDays);
    console.log('totalNegativeDays', totalNegativeDays);
    console.log('Month on Month Data', monthOnMonthData);
    let something: any = {};
    monthOnMonthData.forEach((data: any) => {
        const empty = {
            SL: 0,
            Target: 0,
            NumberOfDays: 0,
            NumberOfSL: 0,
            NumberOfTarget: 0,
        };
        something[data.month] = something[data.month] || empty;
        something[data.month].NumberOfDays += 1;

        if (something[data.month]) {
            if (data.status == 'SL') {
                something[data.month].SL += data.points;
                something[data.month].NumberOfSL += 1;
            } else if (data.status == 'Target') {
                something[data.month].Target += data.points;
                something[data.month].NumberOfTarget += 1;
            }
        } else {
            if (data.status == 'SL') {
                something[data.month] = {
                    SL: data.points,
                    Target: 0,
                };
                something[data.month].NumberOfSL += 1;
            } else if (data.status == 'Target') {
                something[data.month] = {
                    SL: 0,
                    Target: data.points,
                };
                something[data.month].NumberOfTarget += 1;
            }
        }
        something[data.month].number = something[data.month].Target - something[data.month].SL;
    });

    console.log('something', something);
    const FridayStats = tradesArray.filter((trade: any) => {
        return trade.day == 5;
    });
    const calculatedFridayStats = FridayStats.reduce(
        (acc: any, trade: any) => {
            acc.totalSL += trade.SLInPoints;
            acc.totalTarget += trade.target;
            acc.pointsCaptured += trade.pointsCaptured;
            acc.totalPostiveDays += trade.pointsCaptured > 0 ? 1 : 0;
            acc.totalNegativeDays += trade.pointsCaptured < 0 ? 1 : 0;
            return acc;
        },
        {
            totalSL: 0,
            totalTarget: 0,
            pointsCaptured: 0,
            totalPostiveDays: 0,
            totalNegativeDays: 0,
        },
    );
    console.log(calculatedFridayStats);
});
