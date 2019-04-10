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

    let day200 = 0;
    let day100 = 0;
    let day50 = 0;
    let day20 = 0;
    let day10 = 0;
    let day5 = 0;

    values.forEach((value, index) => {
        const floatValue = parseFloat(value[4]);
        if (index <= 5) {
            if (index === 5) {
                day10 += day5 + floatValue;
                day5 = day5 / 5;
                day5 = calcEma(5, day5, floatValue);
            } else {
                day5 += floatValue; // close value
            }
        } else if(index <= 10) {
            day5 = calcEma(5, day5, floatValue);
            if (index === 10) {
                day20 += day10 + floatValue;
                day10 = day10 / 10;
                day10 = calcEma(10, day10, floatValue);
            } else {
                day10 += floatValue; // close value
            }
        } else if(index <= 20) {
            day5 = calcEma(5, day5, floatValue);
            day10 = calcEma(10, day10, floatValue);
            if (index === 20) {
                day50 += day20 + floatValue;
                day20 = day20 / 20;
                day20 = calcEma(20, day20, floatValue);
            } else {
                day20 += floatValue; // close value
            }
        } else if(index <= 50) {
            day5 = calcEma(5, day5, floatValue);
            day10 = calcEma(10, day10, floatValue);
            day20 = calcEma(20, day20, floatValue);
            if (index === 50) {
                day100 += day50 + floatValue;
                day50 = day50 / 50;
                day50 = calcEma(50, day50, floatValue);
            } else {
                day50 += floatValue; // close value
            }
        } else if(index <= 100) {
            day5 = calcEma(5, day5, floatValue);
            day10 = calcEma(10, day10, floatValue);
            day20 = calcEma(20, day20, floatValue);
            day50 = calcEma(50, day50, floatValue);
            if (index === 100) {
                day200 += day100 + floatValue;
                day100 = day100 / 100;
                day100 = calcEma(100, day100, floatValue);
            } else {
                day100 += floatValue; // close value
            }
        } else if(index <= 200) {
            day5 = calcEma(5, day5, floatValue);
            day10 = calcEma(10, day10, floatValue);
            day20 = calcEma(20, day20, floatValue);
            day50 = calcEma(50, day50, floatValue);
            day100 = calcEma(100, day100, floatValue);
            if (index === 200) {
                day200 = day200 / 200;
                day200 = calcEma(200, day200, floatValue);
            } else {
                day200 += floatValue; // close value
            }
        } else {
            day5 = calcEma(5, day5, floatValue);
            day10 = calcEma(10, day10, floatValue);
            day20 = calcEma(20, day20, floatValue);
            day50 = calcEma(50, day50, floatValue);
            day100 = calcEma(100, day100, floatValue);
            day200 = calcEma(200, day200, floatValue);
        }
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
