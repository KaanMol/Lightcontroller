const express = require("express");
const app = express();
const http = require('http').createServer(app);
const Scenes = require("./scenes");
const system = require("./system");
const { Color } = require("./color");

global.io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});
const homekit = require("./homekit");
/**
 * Serve static webpage to root
 */
app.use(express.static("public"))

/**
 * Bind REST API Express
 */
// app.use("/api", api);

const scenes = new Scenes();

async function sync() {
    const preferences = global.db.getData("/preferences");
        
    const data = {
        isSetup: true,
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
        preferences: {
            ...preferences,
            rebootNeeded: global.state.rebootNeeded,
            hostname: await system.getHostname(),
            ip: await system.getIP()
        },
        scenes: scenes.getCollection()
    }

    return data;
}

io.on('connection', (socket) => {
    socket.on("sync", async () => {
        socket.emit("sync", await sync())
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
            let kelvinColor = new Color(value.colors[global.state.kelvinIndex]["$"]).kelvin;
            if (kelvinColor > 9000) {
                kelvinColor = 9000;
            } else if (kelvinColor < 4000) {
                kelvinColor = 4000;
            }
            global.leds.setColors([new Color(Color.kelvinToRgb(kelvinColor))])
        } else {
            global.leds.setColors(value.colors)
        }

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
        
        global.state.activeScene = scene.name;
        socket.broadcast.emit("newScene", scene);
    });

    socket.on("editScene", (scene) => {
        scenes.editScene(scene.name, {
            textColor: scene.textColor,
            background: scene.background
        });
        
        socket.broadcast.emit("newScene", scene);
    });

    socket.on("removeScene", (scene) => {
        scenes.removeScene(scene);

        io.emit("activeScene", "");
        socket.broadcast.emit("removeScene", scene);
    });

    socket.on("applyScene", async (sceneName) => {
        if (sceneName === "") {
            global.state.activeScene = "";
            socket.broadcast.emit("activeScene", "");
            return;
        }

        const scene = { ...scenes.getNode(sceneName)};
        global.state.activeScene = sceneName;
        global.state.isKelvin = scene.isKelvin;
        global.state.kelvinIndex = scene.kelvinIndex;
        global.state.colors = scene.colors;
        global.leds.duration = scene.duration;
        global.leds.rotate.clockwise = scene.clockwiseRotation;
        global.leds.setBrightness(scene.brightness);
        global.leds.setColors(scene.colors);
        global.leds.setMode(scene.mode);

        io.emit("sync", await sync());
    });
    
    socket.on("setHostname", async (hostname) => {
        global.state.rebootNeeded = true;
        await system.setHostname(hostname);
        io.emit("rebootNeeded", true);
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
        setTimeout(system.reboot, 5000);
    });

    socket.on("reset", async (preserve) => {
        await system.reset(preserve);
    });

});

module.exports = http;