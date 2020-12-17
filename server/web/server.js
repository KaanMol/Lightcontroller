const express = require("express");
const app = express();
const http = require('http').createServer(app);
global.io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});
const api = require("./api");
/**
 * Serve static webpage to root
 */
app.use(express.static("public"))

/**
 * Bind REST API Express
 */
app.use("/api", api);

io.on('connection', (socket) => {
    socket.on("sync", () => { 
        socket.emit("sync", global.api)
    });

    socket.on("power", (value) => { 
        global.api.setPower(value, socket.id)
    });

    socket.on("brightness", (value) => { 
        global.api.setBrightness(value, socket.id)
    });

    socket.on("colors", (value) => {
        global.api.setColors(value, socket.id)
    });

    socket.on("duration", (value) => {
        global.api.setDuration(value, socket.id)
    });

    socket.on("mode", (value) => {
        global.api.setMode(value, socket.id)
    });

    socket.on("rotateClockwise", (value) => {
        global.api.setRotateClockwise(value, socket.id)
    });

    socket.on("saveScene", (value) => {
        global.api.saveScene(value, socket.id)
    });

    socket.on("setScene", (value) => {
        global.api.setScene(value)
    });
});

module.exports = http;
