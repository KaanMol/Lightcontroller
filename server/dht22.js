const SENSOR_PIN = global.db.getData("/system/dhtPin")
class Sensor {
    constructor () {
        this.sensor;
        this.temperature = "0";
        this.humidity = "0";

        if (global.db.getData("/system/isProduction")) {
            this.sensor = require("node-dht-sensor");
        } else {
            this.sensor = require("./utils/dht-facade");
        }

        setInterval(() => this.update(), 8000)
    }

    update() {
        this.sensor.read(this.sensor.DHT22, SENSOR_PIN, function(err, temperature, humidity) {
            if (!err) {
                this.temperature = temperature.toFixed(1);
                this.humidity = humidity.toFixed(1);
            }
        }.bind(this));
    }
}

module.exports = Sensor;