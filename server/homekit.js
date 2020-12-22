const hap = require("hap-nodejs");

const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const CharacteristicEventTypes = hap.CharacteristicEventTypes;
const Service = hap.Service;

const config = global.db.getData("/homekit");

const lightAccesoryUuid = hap.uuid.generate(config.uuid);
const lightAccessory = new Accessory(config.lightAccessory, lightAccesoryUuid);
const lightService = new Service.Lightbulb(config.lightBulb);
const temperatureService = new Service.TemperatureSensor(config.temperatureSensor);
const humidityService = new Service.HumiditySensor(config.humiditySensor);



module.exports = {
    setBrightness: (brightness) => {
        lightService
            .getCharacteristic(Characteristic.Brightness).updateValue(brightness);
    },
    setColor: (color) => {
        if (color === undefined) return;

        lightService
            .getCharacteristic(Characteristic.Hue).updateValue(color.h);
        lightService
            .getCharacteristic(Characteristic.Saturation).updateValue(color.s);
    },
    setPower: (value) => {
        console.log(value)
        lightService
            .getCharacteristic(Characteristic.On).updateValue(value);
    },
    service: () => {
        lightAccessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, config.manufacturer)
            .setCharacteristic(Characteristic.Model, config.model)
            .setCharacteristic(Characteristic.SerialNumber, config.serialNumber)
            .setCharacteristic(Characteristic.FirmwareRevision, require("./package.json").version)
        
        lightService
            .getCharacteristic(Characteristic.On)
            .on(CharacteristicEventTypes.GET, callback => {
                callback(undefined, global.leds.isOn);
            })
            .on(CharacteristicEventTypes.SET, (turnOn, callback) => {
                if (turnOn) {
                    global.leds.turnOn();
                } else {
                    global.leds.turnOff();
                }
                global.io.sockets.emit("power", turnOn);
                callback();
            });

        lightService
            .getCharacteristic(Characteristic.Brightness)
            .on(CharacteristicEventTypes.GET, (callback) => {
                callback(undefined, Math.round(global.leds.brightness / 2.55));
            })
            .on(CharacteristicEventTypes.SET, (brightness, callback) => {
                global.leds.setBrightness(Math.round(brightness * 2.55));
                global.io.sockets.emit("brightness", brightness);
                callback();
            });

        lightService
            .getCharacteristic(Characteristic.Hue)
            .on(CharacteristicEventTypes.GET, (callback) => {
                callback(undefined, global.state.colors[global.state.kelvinIndex].$.h);
            })
            .on(CharacteristicEventTypes.SET, (value, callback) => {
                global.leds.mode = 0;
                global.state.colors[global.state.kelvinIndex].$.h = value;
                global.leds.setColors([global.state.colors[global.state.kelvinIndex]]);
                global.io.sockets.emit("colors", {
                    isKelvin: false,
                    kelvinIndex: global.state.kelvinIndex,
                    colors: global.state.colors
                });
                global.io.sockets.emit("mode", 0);
                callback();
            });

        lightService
            .getCharacteristic(Characteristic.Saturation)
            .on(CharacteristicEventTypes.GET, (callback) => {
                callback(undefined, global.state.colors[global.state.kelvinIndex].$.s);
            })
            .on(CharacteristicEventTypes.SET, (value, callback) => {
                global.state.colors[global.state.kelvinIndex].$.s = value;
                callback();
            });


        /**
         * Temperature
         */
        temperatureService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, (callback) => {
                callback(undefined, "22");
            });

        /**
         * Humidity
         */
        humidityService
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on(CharacteristicEventTypes.GET, (callback) => {
                callback(undefined, "50");
            })

        lightAccessory.addService(lightService);
        lightAccessory.addService(temperatureService);
        lightAccessory.addService(humidityService);
        lightAccessory.publish({
            username: config.username,
            pincode: config.pincode,
            port: 47129,
            category: hap.Categories.LIGHTBULB,
        });

        console.log(`Setup URL: ${lightAccessory.setupURI()}`);
        console.log("Accessory setup finished!");
    }
}
