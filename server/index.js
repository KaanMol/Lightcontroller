const JsonDB = require("node-json-db").JsonDB;
const Config = require("node-json-db/dist/lib/JsonDBConfig").Config;
const Oled = require("./utils/oled");

global.db = new JsonDB(new Config("config", true, true, '/'));
global.oled = { write: () => {} }


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

    const Sensor = require("./utils/dht22");
    global.sensor = new Sensor();

    const LEDDriver = require("./utils/leds");
    global.leds = new LEDDriver();

    const webServer = require("./utils/webserver");
    const homekit = require("./utils/homekit");

    homekit.startService();

    webServer.listen(80, async () => {
        const utils = require("./utils/system")
        global.oled.write(`Verbonden met ${global.db.getData("/preferences/network")} \n\n Bereikbaar via: \n http://${await utils.getHostname()}.local \n of \n http://${await utils.getIP()}`);
    });
}

if (!global.db.getData("/system/setup/isFinished")) {
    require("./setup")()
} else {
    //require("./utils/reset")();
    main();
}
