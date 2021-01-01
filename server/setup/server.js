// const express = require("express");
// const app = express();
// const utils = require("./utils");
// const bodyParser = require('body-parser');



// function main() {


//     app.listen(80);
// }

// module.exports = main;

const express = require("express");
const app = express();
const http = require('http').createServer(app);
const utils = require("./utils");
const bodyParser = require('body-parser');
// const system = require("../utils/system");

global.io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

// /**
//  * Serve static webpage to root
//  */
app.use(express.static("public"))

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send(`
        <form action="/save" method="post">
            <input type="text" id="ssid" name="ssid" placeholder="SSID"><br>
            <input type="text" id="password" name="password" placeholder="Password"><br>
            <input type="submit" value="Submit">
        </form>
    `)
})

app.post("/save", async (req, res) => {
    await utils.createWPASupplicant(req.body.ssid, req.body.password);
    setTimeout(async () => { await utils.setupAPClient(req.body.ssid) }, 2000);
    res.send(`OK, REBOOTING`);
})

io.on('connection', (socket) => {
    socket.on("sync", async () => {
        socket.emit("sync", {
            isSetup: false,
            networks: await utils.scanWifiNetworks()
        })
    });

    socket.on("connectNetwork", async ({ ssid, password }) => {
        await utils.createWPASupplicant(ssid, password);
        setTimeout(async () => { await utils.setupAPClient(ssid) }, 2000);
        // socket.emit("reboot")
    })
});

module.exports = http;