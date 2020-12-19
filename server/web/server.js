const e = require("express");
const express = require("express");
const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
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

function getSceneObject() {
    const obj = [];
    for (const [key, value] of Object.entries(global.scenes.getData("/"))) {
        obj.push({
            name: key,
            background: value.background
        });
    }
    return obj;
}

let isKelvin = false;
let kelvinIndex = 0;

io.on('connection', (socket) => {
    socket.on("sync", () => {
        const data = {
            temperature: global.sensor.temperature,
            humidity: global.sensor.humidity,

            power: global.leds.isOn,
            brightness: Math.round(global.leds.brightness / 2.55),
            lightState: {
                colors: global.leds.colors,
                duration: global.leds.duration / 1000,
                isKelvin: isKelvin,
                kelvinIndex: kelvinIndex,
                mode: global.leds.mode,
                rotate: {
                    clockwise: global.leds.rotate.clockwise
                }
            },
            scenes: getSceneObject()
        }

        socket.emit("sync", data)
    });

    socket.on("power", (turnOn) => { 
        if (turnOn) {
            global.leds.turnOn();
        } else {
            global.leds.turnOff();
        }

        socket.broadcast.emit("power", turnOn);
    });

    socket.on("brightness", (brightness) => {
        global.leds.setBrightness(Math.round(brightness * 2.55));

        socket.broadcast.emit("brightness", brightness);
    });

    socket.on("colors", (value) => {
        isKelvin = value.isKelvin;
        kelvinIndex = value.kelvinIndex;

        if (isKelvin) {
            global.leds.mode = 0;
            global.leds.setColors([value.colors[kelvinIndex]])
        } else {
            global.leds.setColors(value.colors)
        }

        socket.broadcast.emit("colors", value);
    });

    socket.on("duration", (duration) => {
        global.leds.setDuration(duration * 1000);

        socket.broadcast.emit("duration", duration);
    });

    socket.on("mode", (mode) => {
        global.leds.setMode(mode);
        socket.broadcast.emit("mode", global.leds.mode);
    });

    socket.on("clockwiseRotation", (value) => {
        global.leds.setClockwiseRotation(value);
        socket.broadcast.emit("clockwiseRotation", value);
    });

    socket.on("saveScene", (value) => {
        // global.api.saveScene(value, socket.id)
    });

    socket.on("setScene", (value) => {
        // global.api.setScene(value)
    });
});

module.exports = http;

// saveScene(scene, socketId) {
//     const newScene = {
//         background: scene.background,
//         brightness: this.state.brightness,
//         lightState: {
//             mode: this.state.lightState.mode,
//             isKelvin: this.state.lightState.isKelvin,
//             kelvinIndex: this.state.lightState.kelvinIndex,
//             colors: this.state.lightState.colors.map(color => color.hexString),
//             duration: this.state.lightState.duration,
//             rotate: {
//                 clockwise: this.state.lightState.rotate.clockwise
//             }
//         }
//     };

//     global.scenes.push(`/${scene.name}`, newScene);
//     this.emit("scene", scene, socketId);
// }

// setScene(sceneName) {
//     const scene = global.scenes.getData(`/${sceneName}`);
//     scene.lightState.colors = scene.lightState.colors.map(color => new Color(color));
//     scene.lightState.rotate = {
//         offset: 0
//     };

//     this.state = {
//         ...this.state,
//         ...scene
//     }

//     this.emit("sync", global.api);
//     this.render("brightness")
//     this.render("mode")
// }