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
        summation += parseFloat(values[index - i][4]);
    }

    mean = summation / 20;

    for (let i = 0; i < 20; i += 1) {
        sqDiffSum += (Math.pow((parseFloat(values[index - i][4]) - mean), 2));
    }

    meanSqDiff = sqDiffSum / 20;

    return Math.sqrt(meanSqDiff);
}

// Ichimoku Cloud
// Conversion Line (9-period High + 9-period Low) / 2
// Base Line (26-period High + 26-period Low) / 2
// Leading Span A (Conversion Line + Base Line) / 2
// Leading Span B (52-period High + 52-period Low) / 2
// Lagging Span Close plotted 26 days in the past
function calcIchimokuCloud(index, values) {
    let period9high  = period26high = period52high = parseFloat(values[index][2]);
    let period9low = period26low = period52low = parseFloat(values[index][3]);
    let kenkanSen = kijunSen = senkouSpanA = senkouSpanB = chikouSpan = 0;

    for (let i = 0; i < 52; i += 1) {
        const floatLow = parseFloat(values[index - i][3]);
        const floatHigh = parseFloat(values[index - i][2]);
        if (i < 9) {
            if (floatLow < period9low) {
                period9low = floatLow;
            }
            if (floatHigh > period9high) {
                period9high = floatHigh;
            }
        }

        if (i < 26) {
            if (floatLow < period26low) {
                period26low = floatLow;
            }
            if (floatHigh > period26high) {
                period26high = floatHigh;
            }
        }

        if (i < 52) {
            if (floatLow < period52low) {
                period52low = floatLow;
            }
            if (floatHigh > period52high) {
                period52high = floatHigh;
            }
        }
    }

    kenkanSen = ((period9high + period9low) / 2);
    kijunSen = ((period26high + period26low) / 2);
    senkouSpanB = ((period52high + period52low) / 2);
    senkouSpanA = ((kenkanSen + kijunSen) / 2)
    chikouSpan = parseFloat(values[index][4]);

    return {
        kenkanSen,
        kijunSen,
        senkouSpanA,
        senkouSpanB,
        chikouSpan
    };
}

module.exports = {
    calcEmaDay,
    calcSmaDay,
    calcRsi,
    calcCMF,
    calcOBV,
    calcSD,
    calcIchimokuCloud,
}