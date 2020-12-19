const TICKS = 200;
module.exports = {
    calculateFade(a, b) {
        let colorSteps = [];
        let hsv = ["h", "s", "v"];
        for (let i = 0; i < 3; i++) {
            let maxCounterClock = 0;
            let maxClock = 0;
            let startingColor = a.hsv[hsv[i]];
            let endingColor = b.hsv[hsv[i]];

            if (i === 0) {
                if (startingColor > endingColor) {
                    maxCounterClock = startingColor - endingColor;
                    maxClock = (endingColor + 359) - startingColor;
                } else {
                    maxCounterClock = endingColor - startingColor;
                    maxClock = (startingColor + 359) - endingColor;
                }

                if (maxCounterClock > maxClock) {
                    colorSteps[i] = (endingColor > startingColor ? maxClock * -1 : maxClock) / TICKS;
                } else {
                    colorSteps[i] = (endingColor < startingColor ? maxCounterClock * -1 : maxCounterClock) / TICKS;
                }
            } else {
                colorSteps[i] = (endingColor - startingColor) / TICKS;
            }
        }

        return colorSteps;
    }
}