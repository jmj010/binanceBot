// const Binance = require('binance-api-node').default;
const AWS = require('aws-sdk');
const axios = require('axios');
const { calcEmaDay, calcSmaDay } = require('./functions');

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
 Add indicators that fire off when the indicators cross.
*/

function calculateEma(values) {
    let ema200 = ema100 = ema50 = ema20 = ema10 = ema5 = 0;
    let sma200 = sma100 = sma50 = sma20 = sma10 = sma5 = 0;

    values.forEach((value, index) => {
        const floatValue = parseFloat(value[4]);

        ema5 = calcEmaDay(index, 5, ema5, floatValue);
        ema10 = calcEmaDay(index, 10, ema10, floatValue);
        ema20 = calcEmaDay(index, 20, ema20, floatValue);
        ema50 = calcEmaDay(index, 50, ema50, floatValue);
        ema100 = calcEmaDay(index, 100, ema100, floatValue);
        ema200 = calcEmaDay(index, 200, ema200, floatValue);

        sma5 = calcSmaDay(index, values.length, 5, sma5, floatValue);
        sma10 = calcSmaDay(index, values.length, 10, sma10, floatValue);
        sma20 = calcSmaDay(index, values.length, 20, sma20, floatValue);
        sma50 = calcSmaDay(index, values.length, 50, sma50, floatValue);
        sma100 = calcSmaDay(index, values.length, 100, sma100, floatValue);
        sma200 = calcSmaDay(index, values.length, 200, sma200, floatValue);
    })

    return {
        ema5, ema10, ema20, ema50, ema100, ema200,
        sma5, sma10, sma20, sma50, sma100, sma200,
    }
}

trackCoins.forEach(coin => promises.push(getBinanceData(startTime, endTime, limit, coin))); // Eventually bump this up to 200 data points

Promise.all(promises).then((values) => {
    console.log(values);
    const emas = values.map(value => calculateEma(value));
    console.log(emas);
});
