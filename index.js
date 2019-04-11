// const Binance = require('binance-api-node').default;
const AWS = require('aws-sdk');
const axios = require('axios');

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

/*
 TODO: Goals for tomorrow
 Clean up calculateEma
 Add indicators that fire off when the indicators cross.
*/

function calculateEma(values) {
    function calcEma(period, previous, value) {
        return (((value - previous) * (2/(period+1)) + previous));
    }

    function calcEmaDay(index, period, previousEma, close) {
        let returnValue = previousEma;
        if (index < period) {
            returnValue += close;
            if (index === (period - 1)) {
                returnValue = returnValue / period;
            }
        } else {
            returnValue = calcEma(period, returnValue, close);
        }
        return returnValue;
    }

    let ema200 = 0;
    let ema100 = 0;
    let ema50 = 0;
    let ema20 = 0;
    let ema10 = 0;
    let ema5 = 0;

    values.forEach((value, index) => {
        const floatValue = parseFloat(value[4]);
        ema5 = calcEmaDay(index, 5, ema5, floatValue);
        ema10 = calcEmaDay(index, 10, ema10, floatValue);
        ema20 = calcEmaDay(index, 20, ema20, floatValue);
        ema50 = calcEmaDay(index, 50, ema50, floatValue);
        ema100 = calcEmaDay(index, 100, ema100, floatValue);
        ema200 = calcEmaDay(index, 200, ema200, floatValue);
    })

    return {
        5: ema5,
        10: ema10,
        20: ema20,
        50: ema50,
        100: ema100,
        200: ema200
    }
}

trackCoins.forEach(coin => promises.push(getBinanceData(startTime, endTime, limit, coin))); // Eventually bump this up to 200 data points

Promise.all(promises).then((values) => {
    console.log(values);
    const emas = values.map(value => calculateEma(value));
    console.log(emas);
});
