const express = require("express");
const app = express();
const http = require('http').createServer(app);
const Scenes = require("../core/scenes");
const system = require("../utils/system");

global.io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});
const homekit = require("../homekit");
/**
 * Serve static webpage to root
 */
app.use(express.static("public"))

/**
 * Bind REST API Express
 */
// app.use("/api", api);

const scenes = new Scenes();

io.on('connection', (socket) => {
    socket.on("sync", async () => {
        const preferences = global.db.getData("/preferences");
        preferences.rebootNeeded = false;
        preferences.hostname = await system.getHostname();
        preferences.ip = await system.getIP();

        const data = {
            temperature: global.sensor.temperature,
            humidity: global.sensor.humidity,
            power: global.leds.isOn,
            brightness: Math.round(global.leds.brightness / 2.55),
            activeScene: global.state.activeScene,
            lightState: {
                colors: global.state.colors,
                duration: global.leds.duration / 1000,
                isKelvin: global.state.isKelvin,
                kelvinIndex: global.state.kelvinIndex,
                mode: global.leds.mode,
                rotate: {
                    clockwise: global.leds.rotate.clockwise
                }
            },
            preferences,
            scenes: scenes.getCollection()
        }

        socket.emit("sync", data)
    });

    setInterval(() => {
        socket.emit("sensorUpdate", { 
            temperature: global.sensor.temperature,
            humidity: global.sensor.humidity
        });
    }, 8000)

    socket.on("power", (turnOn) => { 
        if (turnOn) {
            global.leds.turnOn();
        } else {
            global.leds.turnOff();
        }

        console.log(turnOn)
        homekit.setPower(turnOn);

        socket.broadcast.emit("power", turnOn);
    });

    socket.on("brightness", (brightness) => {
        global.leds.setBrightness(Math.round(brightness * 2.55));
        homekit.setBrightness(brightness);
        socket.broadcast.emit("brightness", brightness);
    });

    socket.on("colors", (value) => {
        global.state.isKelvin = value.isKelvin;
        global.state.kelvinIndex = value.kelvinIndex;
        global.state.colors = value.colors;

        if (global.state.isKelvin) {
            global.leds.mode = 0;
            global.leds.setColors([value.colors[global.state.kelvinIndex]])
        } else {
            global.leds.setColors(value.colors)
        }
        // console.log(value.colors[value.kelvinIndex]);
        homekit.setColor(value.colors[value.kelvinIndex].$)

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

    socket.on("createScene", (scene) => {
        scenes.createScene({
            name: scene.name,
            textColor: scene.textColor,
            background: scene.background,
            brightness: global.leds.brightness,
            mode: global.leds.mode,
            isKelvin: global.state.isKelvin,
            kelvinIndex: global.state.kelvinIndex,
            colors: global.state.colors,
            duration: global.leds.duration,
            clockwiseRotation: global.leds.rotate.clockwise
        });

        socket.broadcast.emit("newScene", scene);
    });

    socket.on("applyScene", (sceneName) => {
        const scene = scenes.getNode(sceneName);
        global.state.activeScene = sceneName;
        global.state.isKelvin = scene.isKelvin;
        global.state.kelvinIndex = scene.kelvinIndex;
        global.state.colors = scene.colors;
        global.leds.colors = scene.colors;
        global.leds.duration = scene.duration;
        global.leds.rotate.clockwise = scene.clockwiseRotation;
        global.leds.setBrightness(scene.brightness);
        global.leds.setMode(scene.mode);

        socket.broadcast.emit("activeScene", sceneName);
    });

    socket.on("setHostname", async (hostname) => {
        global.state.rebootNeeded = true;
        await system.setHostname(hostname);
        socket.broadcast.emit("rebootNeeded", true);
    });

    socket.on("theme", ({ type, value }) => {
        global.db.push("/preferences/ui", { [type]: value }, false);
        socket.broadcast.emit("theme", { type, value });
    });

    socket.on("scene", ({ type, value }) => {
        global.db.push("/preferences/scene", { [type]: value }, false);
        socket.broadcast.emit("scene", { type, value });
    });

    socket.on("reboot", () => {
        console.log("reboot")
        // setTimeout(system.reboot, 5000);
    });

});

module.exports = http;