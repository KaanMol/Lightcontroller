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
            callback(undefined, global.api.power);
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            global.api.power = value;
            callback();
        });

    lightService
        .getCharacteristic(Characteristic.Brightness)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.api.brightness);
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            global.api.brightness = value;
            callback();
        });

    lightService
        .getCharacteristic(Characteristic.ColorTemperature)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.api.kelvin);
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            console.log(`ColorTemperature: ${value}`);
            global.api.kelvin = value;
            callback();
        });

    lightService
        .getCharacteristic(Characteristic.Hue)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.api.hue);
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            global.api.hue = value;
            callback();
        });

    lightService
        .getCharacteristic(Characteristic.Saturation)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.api.saturation);
        })
        .on(CharacteristicEventTypes.SET, (value, callback) => {
            global.api.saturation = value;
            callback();
        });


    /**
     * Temperature
     */
    temperatureService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.api.temperature);
        });

    /**
     * Humidity
     */
    humidityService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on(CharacteristicEventTypes.GET, (callback) => {
            callback(undefined, global.api.humidity);
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
