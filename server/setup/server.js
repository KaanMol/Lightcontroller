const express = require("express");
const app = express();
const utils = require("./utils");
const bodyParser = require('body-parser');

function main() {
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
        setTimeout(utils.setAPClientMode, 2000);
        res.send(`OK, REBOOTING`);
    })

    app.listen(80);
}

module.exports = main;