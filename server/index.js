const JsonDB = require("node-json-db").JsonDB;
const Config = require("node-json-db/dist/lib/JsonDBConfig").Config;
global.db = new JsonDB(new Config("config", true, true, '/'));
global.scenes = new JsonDB(new Config("scenes", true, true, '/'));
const webServer = require("./web/server");
const homekit = require("./homekit");
const API = require("./api");

function main() {
    // if (!global.db.getData("/system/isSetup")) {
    //     const installer = require("installer");

    // }
    global.api = new API();

    if (global.db.getData("/system/isProduction")) {
        const schedular = require("./schedular");
        schedular.dht22.start();
    }

    homekit();

    webServer.listen(80, () => {
        console.log("started");
    });
}

main();