module.exports = function() {
    if (global.db.getData("/system/isProduction")) {
        // require("node-dht-sensor").read(22, global.db.getData("/system/dhtPin"), function(err, temperature, humidity) {
        //     if (!err) {
        //         global.api.setSensorInfo({
        //             temperature: temperature.toFixed(1),
        //             humidity: humidity.toFixed(1)
        //         });
        //     }
        // });
    }
};
