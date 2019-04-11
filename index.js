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

    let day200 = 0;
    let day100 = 0;
    let day50 = 0;
    let day20 = 0;
    let day10 = 0;
    let day5 = 0;

    values.forEach((value, index) => {
        const floatValue = parseFloat(value[4]);
        day5 = calcEmaDay(index, 5, day5, floatValue);
        day10 = calcEmaDay(index, 10, day10, floatValue);
        day20 = calcEmaDay(index, 20, day20, floatValue);
        day50 = calcEmaDay(index, 50, day50, floatValue);
        day100 = calcEmaDay(index, 100, day100, floatValue);
        day200 = calcEmaDay(index, 200, day200, floatValue);
    })

    return {
        5: day5,
        10: day10,
        20: day20,
        50: day50,
        100: day100,
        200: day200
    }
}

trackCoins.forEach(coin => promises.push(getBinanceData(startTime, endTime, limit, coin))); // Eventually bump this up to 200 data points

Promise.all(promises).then((values) => {
    console.log(values);
    const emas = values.map(value => calculateEma(value));
    console.log(emas);
});
