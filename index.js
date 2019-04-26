// const Binance = require('binance-api-node').default;
const AWS = require('aws-sdk');
const axios = require('axios');
const { calcEmaDay, calcSmaDay, calcRsi, calcCMF, calcOBV } = require('./functions');

const binance_endpoint = 'https://api.binance.com';
const api = '/api'
const version = '/v1';

const endpoint = binance_endpoint + api + version;

const limit = 500;
const endTime = new Date().getTime();
const startTime = endTime - (24 * 60 * 60 * 1000 * limit);
const promises = [];
const trackCoins = ['LTCBTC'];//, 'ETHBTC', 'BTCUSDT', 'ADABTC', 'ICXBTC', 'NEOBTC'];

function getBinanceData(startTime, endTime, limit, symbol) {
    return new Promise((resolve, reject) => {
        axios.get(endpoint + `/klines?symbol=${symbol}&interval=1d&limit=${limit}&startTime=${startTime}&endTime=${endTime}`).then((res) => {
            resolve(res.data);
        }).catch((err) => {
            console.log('Error: ' + err);
            reject(err);
        })
    });
};

/*function checkCrossOvers(day5, day10, day20, day50, day100, day200, type) {

}*/

function calculateEma(values) {
    let ema5 = ema10 = ema20 = ema30 = ema40 = ema50 = ema60 = ema100 = ema200 = 0;
    let sma5 = sma10 = sma20 = sma50 = sma100 = sma200 = 0;
    let rsiGain = rsiLoss = rsi = 0;
    let macd = ema9 = ema12 = ema26 = 0; // ema9 is used as signal line. When macd is below signal it is bearish. When it is above it is bullish?
    let sma5hl = sma34hl = 0;
    let ao = 0;
    let cmf = mfv = volume = 0;
    let obv = 0;

    values.forEach((value, index) => {
        const floatHigh = parseFloat(value[2]);
        const floatLow = parseFloat(value[3]);
        const floatClose = parseFloat(value[4]);
        const floatVolume = parseFloat(value[5]);
        const prevFloatClose = index === 0 ? 0 : parseFloat(values[index - 1][4]);

        // Exponential moving averages
        ema5 = calcEmaDay(index, 5, ema5, floatClose);
        ema10 = calcEmaDay(index, 10, ema10, floatClose);
        ema20 = calcEmaDay(index, 20, ema20, floatClose);
        ema50 = calcEmaDay(index, 50, ema50, floatClose);
        ema100 = calcEmaDay(index, 100, ema100, floatClose);
        ema200 = calcEmaDay(index, 200, ema200, floatClose);

        // EMA Ribbons. Use 10, 20, 30, 40, 50 and 60 day ema lines
        ema30 = calcEmaDay(index, 30, ema30, floatClose);
        ema40 = calcEmaDay(index, 40, ema40, floatClose);
        ema60 = calcEmaDay(index, 60, ema60, floatClose);

        // Calculate for macd. 9 is the signal line
        ema9 = calcEmaDay(index, 9, ema9, floatClose);
        ema12 = calcEmaDay(index, 12, ema12, floatClose);
        ema26 = calcEmaDay(index, 26, ema26, floatClose);
        macd = ema12 - ema26;

        // Simple moving averages
        sma5 = calcSmaDay(index, values.length, 5, sma5, floatClose);
        sma10 = calcSmaDay(index, values.length, 10, sma10, floatClose);
        sma20 = calcSmaDay(index, values.length, 20, sma20, floatClose);
        sma50 = calcSmaDay(index, values.length, 50, sma50, floatClose);
        sma100 = calcSmaDay(index, values.length, 100, sma100, floatClose);
        sma200 = calcSmaDay(index, values.length, 200, sma200, floatClose);

        // Trend confirmation
        // Calculations for the awesome oscillator. value[2] is the High. value[3] is the Low
        // NOTE: If you want sliding window of values? send for second parameter different sized array. So it calcs earlier
        sma5hl = calcSmaDay(index, values.length, 5, sma5hl, (floatHigh + floatLow) /2 );
        sma34hl = calcSmaDay(index, values.length, 34, sma34hl, (floatHigh + floatLow) /2 )
        ao = sma5hl - sma34hl;

        // Ignore RSI readings up to n period
        if (index !== 0) {
            const rsiResult = calcRsi(index, 14, rsiGain, rsiLoss, prevFloatClose, floatClose);
            rsiGain = rsiResult.rsiGain;
            rsiLoss = rsiResult.rsiLoss;
            rsi = rsiResult.rsi;
        }

        // Chaiken money flow good for volume readings. Positive indicates bullish momentum while negative indicates selling pressure with bearish trend.
        const result = calcCMF(index, values.length, 21, floatLow, floatHigh, floatClose, floatVolume, mfv, volume);
        mfv = result.newMFV;
        volume = result.newVolume;
        cmf = result.CMF;

        // On Balance Volume Indicator
        if (index !== 0) {
            const obv = calcOBV(obv, prevFloatClose, floatClose, floatVolume);
        }
    })

    return {
        ema5, ema10, ema20, ema30, ema40, ema50, ema60, ema100, ema200,
        sma5, sma10, sma20, sma50, sma100, sma200,
        rsi, macd, macdSignal: ema9, ao, cmf, obv,
    }
}

trackCoins.forEach(coin => promises.push(getBinanceData(startTime, endTime, limit, coin)));

Promise.all(promises).then((values) => {
    const emas = values.map(value => calculateEma(value));
    console.log(emas);
});
