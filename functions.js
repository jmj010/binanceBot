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

function calcCMF(index, size, period, low, high, close, volume, previousMFV, previousVolume) {
    let newMFV = previousMFV;
    let newVolume = previousVolume;
    let CMF = 0;

    if (index >= (size - period)) {
        newMFV += ((((close - low) - (high - close))/(high - low)) * volume);
        newVolume += volume;
    }

    if (index === (size - 1)) {
        CMF = newMFV / newVolume;
    }

    return { newMFV, newVolume, CMF};
}

function calcOBV(prevOBV, prevClose, close, volume) {
    if (prevClose === close) {
        return prevOBV;
    } else if(close > prevClose) {
        return (prevOBV + volume);
    } else {
        return (prevOBV - volume);
    }
}

function calcSD(index, values) {
    let summation = 0;
    let mean = 0;
    let sqDiffSum = 0;
    let meanSqDiff = 0;

    for (let i = 0; i < 20; i += 1) {
        summation += values[index - i];
    }

    mean = summation / 20;

    for (let i = 0; i < 20; i += 1) {
        sqDiffSum += (Math.pow((values[index-1] - mean), 2));
    }

    meanSqDiff = sqDiffSum / 20;

    return Math.sqrt(meanSqDiff);
}

module.exports = {
    calcEmaDay,
    calcSmaDay,
    calcRsi,
    calcCMF,
    calcOBV,
    calcSD,
}