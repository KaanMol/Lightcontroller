const JsonDB = require("node-json-db").JsonDB;
const Config = require("node-json-db/dist/lib/JsonDBConfig").Config;

global.db = new JsonDB(new Config("config", true, true, '/'));
global.scenes = new JsonDB(new Config("scenes", true, true, '/'));

const Sensor = require("./dht22");
global.sensor = new Sensor();

const LEDDriver = require("./core/leds");
global.leds = new LEDDriver();

const webServer = require("./web/server");
const homekit = require("./homekit");



function main() {
    // if (!global.db.getData("/system/isSetup")) {
    //     const installer = require("installer");

    // }
    homekit();

    webServer.listen(80, () => {
        console.log("started");
    });
}

main();