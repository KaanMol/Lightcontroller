const JsonDB = require("node-json-db").JsonDB;
const Config = require("node-json-db/dist/lib/JsonDBConfig").Config;

global.db = new JsonDB(new Config("config", true, true, '/'));

function main() {
    global.state = {
        colors: [{ "$": { h: 0, s: 0, v: 100} }],
        isKelvin: false,
        singleColor: false,
        kelvinIndex: 0,
        activeScene: "",
        rebootNeeded: false
    }
    
    global.scenes = new JsonDB(new Config("scenes", true, true, '/'));

    const Sensor = require("./dht22");
    global.sensor = new Sensor();

    const LEDDriver = require("./core/leds");
    global.leds = new LEDDriver();

    const webServer = require("./web/server");
    const homekit = require("./homekit");

    homekit.service();

    webServer.listen(80, () => {
        console.log("started");
    });
}

if (!global.db.getData("/system/setup/isFinished")) {
    require("./setup")();
} else {
    main();
}
