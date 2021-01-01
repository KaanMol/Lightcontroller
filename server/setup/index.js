const utils = require("./utils");

async function main() {
    const config = global.db.getData("/system/setup");

    if (!config.isAccessPoint) {
        global.oled.write("Installatie \n\n AccessPoint aan het aanmaken...");
        utils.setupAccessPoint();
    }

    require("./server").listen(80, () => {
        global.oled.write(`Installatie \n\n Verbindt met het WiFi netwerk "Emma's Lamp Setup" en navigeer naar: http://10.0.0.1 \n of \n http://emma.local`);
    });
}

module.exports = main;