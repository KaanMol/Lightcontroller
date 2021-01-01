const SENSOR_PIN = global.db.getData("/system/dhtPin")
class Sensor {
    constructor () {
        this.sensor;
        this.temperature = "0";
        this.humidity = "0";

        if (global.db.getData("/system/isProduction")) {
            this.sensor = require("node-dht-sensor");
        } else {
            this.sensor = require("./dht-facade");
        }

        setInterval(this.update.bind(this), 8000)
    }

    update() {
        const self = this;
        this.sensor.read(22, 4, (err, temperature, humidity) => {
            if (!err) {
                self.temperature = temperature.toFixed(1);
                self.humidity = humidity.toFixed(1);
            }
        });
    }
}

module.exports = Sensor;