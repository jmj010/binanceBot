function calcEmaDay(index, period, previousEma, close) {
    function calcEma(period, previous, value) {
        return (((value - previous) * (2/(period+1)) + previous));
    }

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

function calcSmaDay(index, size, period, previousSma, close) {
    let returnValue = previousSma;

    if (index >= (size - period)) {
        returnValue += close;
    }

    if (index === (size - 1)) {
        returnValue = returnValue / period;
    }

    return returnValue;
}

// RSI over 70 is over bought. Under 30 is over sold. Over 80 and under 20 is extremes
function calcRsi(index, period, previousGains, previousLosses, previousClose, newClose) {
    let rsiGain = previousGains;
    let rsiLoss = previousLosses;
    let rsi = 0;

    if (index > period) {
        rsiGain = (rsiGain * (period - 1));
        rsiLoss = (rsiLoss * (period - 1));
    }

    if (newClose > previousClose) {
        rsiGain += (newClose - previousClose);
    } else if (newClose < previousClose) {
        rsiLoss += (previousClose - newClose); 
    }

    if (index >= period ) {
        rsiGain = rsiGain / period;
        rsiLoss = rsiLoss / period;
        rsi = rsiGain / rsiLoss;
        rsi = (100 - (100 / (1 + rsi)));
    }

    return { rsiGain, rsiLoss, rsi };
}

// CalcMacd
// CalcBollingerBands - sma with 2 standard deviations above and below.
// EmaRibbons - 5 different emas chosen

// Ichimoku cloud? When price is above clouds the trend is up. While it is below cloud the trend is down.
// Within the cloud it is dicey. Cool thing is that compared to other lagging indicators ichimoku cloud tells support/resistance
// levels projected into the future.

// Awesome oscillator - trend confirmation

// Best volume indicators

// Chaikin money flow
// OBV, On balance volume?
// Maybe klinger oscillator? Doesnt seem as useful

module.exports = {
    calcEmaDay,
    calcSmaDay,
    calcRsi,
}