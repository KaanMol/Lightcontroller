const hap = require("hap-nodejs");

const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const CharacteristicEventTypes = hap.CharacteristicEventTypes;
const Service = hap.Service;

module.exports = () => {
    const config = global.db.getData("/homekit");

    const lightAccesoryUuid = hap.uuid.generate(config.uuid);
    const lightAccessory = new Accessory(config.lightAccessory, lightAccesoryUuid);

    const lightService = new Service.Lightbulb(config.lightBulb);
    const temperatureService = new Service.TemperatureSensor(config.temperatureSensor);
    const humidityService = new Service.HumiditySensor(config.humiditySensor);

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
            callback();
        });

    lightService
        .getCharacteristic(Characteristic.Brightness)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, Math.round(global.leds.brightness / 2.55));
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            global.leds.setBrightness(Math.round(value * 2.55));
            callback();
        });

    lightService
        .getCharacteristic(Characteristic.Hue)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.leds.colors[0].hue);
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            global.leds.colors[0].hue = value;
            global.leds._render();
            callback();
        });

    lightService
        .getCharacteristic(Characteristic.Saturation)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.leds.colors[0].saturation);
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            global.leds.colors[0].saturation = value;
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
