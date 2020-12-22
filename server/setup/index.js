const utils = require("./utils");

async function main() {
    const config = global.db.getData("/system/setup");

    if (!isAccessPoint) {
        utils.setupAccessPoint();
    }

    require("./server")();
}

module.exports = main;