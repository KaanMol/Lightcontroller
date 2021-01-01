class Oled {
    constructor() {
        this.oled;
        this.font;
        this.screenOff;
        this.isOff = false;

        if (global.db.getData("/system/isProduction")) {
            const i2c = require('i2c-bus');
            const i2cBus = i2c.openSync(1);
            const OledDriver = require('oled-i2c-bus');
            
            this.oled = new OledDriver(i2cBus, {
                width: 128,
                height: 64,
                address: 0x3C
            });
            this.oled.clearDisplay();
            this.font = require('oled-font-5x7');
        } else {
            this.oled = require("./oled-facade");
        }
    }

    write(text) {
        if (this.screenOff !== undefined) {
            clearTimeout(this.screenOff);
            this.screenOff = undefined;
        }

        if (this.isOff) {
            this.oled.turnOnDisplay();
        }

        this.oled.clearDisplay();
        this.oled.setCursor(1, 1);
        this.oled.writeString(this.font, 1, text, 1, true);
        this.screenOff = setTimeout(this.oled.turnOffDisplay, 10000);
    }
};

module.exports = Oled;


 
