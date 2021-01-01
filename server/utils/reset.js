let gpio;

if (global.db.getData("/system/isProduction")) {
    gpio = require('rpi-gpio').promise;
} else {
    gpio = {
        DIR_IN: 0,
        setup: () => {},
        read: () => {}
    }
}

async function main() {
    await gpio.setup(37, gpio.DIR_IN);
    let startTime;
    let secondsBeforeReset = 10;
    //while(true) {
    //    console.log(await gpio.read(37))
    //}
    // while (await gpio.read(37) && secondsBeforeReset !== 0) {
    //     if (startTime === undefined) {
    //         startTime = Math.round(Date.now() / 1000)
    //         global.oled.write(`Fabrieksinstellingen\n\nApparaat wordt gereset over 10 second(en)`);
    //     }

    //     const difference = 10 - (Math.round(Date.now() / 1000) - startTime);

    //     if (difference < secondsBeforeReset) { 
    //         secondsBeforeReset = difference;
    //         global.oled.write(`Fabrieksinstellingen\n\nApparaat wordt gereset over ${difference} second(en)`);
    //     }
    // }

    // if (secondsBeforeReset === 0) {
    //     global.oled.write(`Fabrieksinstellingen\n\nApparaat wordt nu gereset...`);
    //     return;
    // }

    // global.oled.write(`Fabrieksinstellingen\n\nReset afgebroken`);
}

module.exports = main;