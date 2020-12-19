const { Color } = require("./utils");

let leds;
const NUM_LEDS = 60
const pixelData = new Array(NUM_LEDS);
const TICKS = 200;


if (global.db.getData("/system/isProduction")) {
    leds = require('rpi-ws281x-native');
    leds.init(NUM_LEDS);

    process.on('SIGINT', function () {
        leds.reset();
        process.nextTick(function () { process.exit(0); });
    }); 
}

function calculateFade(a, b) {
    let colorSteps = [];
    let hsv = ["h", "s", "v"];
    for (let i = 0; i < 3; i++) {
        let maxCounterClock = 0;
        let maxClock = 0;
        let startingColor = a.hsv[hsv[i]];
        let endingColor = b.hsv[hsv[i]];
        
        if (i === 0) {
            if (startingColor > endingColor) {
                maxCounterClock = startingColor - endingColor;
                maxClock = (endingColor + 359) - startingColor;
            } else {
                maxCounterClock = endingColor - startingColor;
                maxClock = (startingColor + 359) - endingColor;
            }
    
            if (maxCounterClock > maxClock) {
                colorSteps[i] = (endingColor > startingColor ? maxClock * -1 : maxClock) / TICKS;
            } else {
                colorSteps[i] = (endingColor < startingColor ? maxCounterClock * -1 : maxCounterClock) / TICKS;
            }
        } else {
            colorSteps[i] = (endingColor - startingColor) / TICKS;
        }
    }

    return colorSteps;
}

function fade(api) {
    const state = api.state.lightState;
    
    if (state.fade.init === false) {
        state.fade = {
            init: true,
            currentTick: 0,
            currentColor: 0,
            steps: calculateFade(state.colors[0], state.colors[1])
        };
    }

    if (state.fade.currentTick < TICKS) {
        const currentColor = new Color(state.colors[state.fade.currentColor].hsv);
        const newValues = {
            h: currentColor.hsv.h + (state.fade.steps[0] * state.fade.currentTick),
            s: currentColor.hsv.s + (state.fade.steps[1] * state.fade.currentTick),
            v: currentColor.hsv.v + (state.fade.steps[2] * state.fade.currentTick)
        };

        newValues.h < 0 ? newValues.h+=360 : newValues.h;
        newValues.s < 0 ? newValues.s+=100 : newValues.s;
        newValues.v < 0 ? newValues.v+=100 : newValues.v;

        currentColor.hsv = newValues;

        for (let i = 0; i < NUM_LEDS; i++) {
            pixelData[i] = currentColor.int;
        }
        
        if (global.db.getData("/system/isProduction")) {
            leds.render(pixelData);
        }

        state.fade.currentTick++;
    }

    if (state.fade.currentTick === TICKS) {
        const newColor = (state.fade.currentColor + 1) % state.colors.length;
        state.fade = {
            init: true,
            currentTick: 0,
            currentColor: newColor,
            steps: calculateFade(state.colors[newColor], state.colors[(newColor + 1) % state.colors.length])
        }
    }
}

function rotate(api) {
    const state = api.state.lightState;

    let breakpoint = NUM_LEDS / state.colors.length;
    let colorIndex = 0;
    for (let i = 0; i < NUM_LEDS; i++) {
        if (i !== 0 && i % breakpoint === 0) {
            colorIndex++;
        }
        pixelData[(i + state.rotate.offset) % NUM_LEDS] = state.colors[colorIndex].int;
    }

    state.rotate.offset = (state.rotate.offset + 1) % NUM_LEDS;

    if (global.db.getData("/system/isProduction")) {
        leds.render(pixelData);
    }
}

function animate(renderer, api) {
    const animation = function() { renderer(api); api.updater = setTimeout(animation, api.state.lightState.duration * 1000 / TICKS) }
    animation();
}

function handleLeds(api) {
    const state = api.state.lightState;
    
    switch (state.mode) {
        case API.LIGHT_MODES.STATIC:
            if (state.isKelvin) {
                for (let i = 0; i < NUM_LEDS; i++) {
                    pixelData[i] = state.colors[state.kelvinIndex].int;
                }
                break;
            }

            let breakpoint = NUM_LEDS / state.colors.length;
            let colorIndex = 0;
            for (let i = 0; i < NUM_LEDS; i++) {
                if (i !== 0 && i % breakpoint === 0) {
                    colorIndex++;
                }
                pixelData[i] = state.colors[colorIndex].int;
            }
            break;
        case API.LIGHT_MODES.ROTATE:
            if (api.updater === undefined) {
                animate(rotate, api);
            }
            break;
        case API.LIGHT_MODES.ALTERNATING:
            for (let i = 0; i < NUM_LEDS; i++) {
                pixelData[i] = state.colors[i % state.colors.length].int;
            }
            break;
        case API.LIGHT_MODES.FADE:
            if (api.updater === undefined) {
                animate(fade, api);
            }
            
    };

    if (global.db.getData("/system/isProduction") && state.mode !== API.LIGHT_MODES.FADE) {
        leds.render(pixelData);
    }
}

function handleBrightness(brightness) {
    if (global.db.getData("/system/isProduction")) {
        leds.setBrightness(brightness);
    }
}

function renderLeds(api, changed) {
    const state = api.state;
    
    switch(changed) {
        case "init":
            handleBrightness(state.brightness);
            handleLeds(api);
            break;
        case "power":
            if (state.power) {
                handleBrightness(state.brightness);

                if (state.lightState.mode === API.LIGHT_MODES.ROTATE || 
                    state.lightState.mode === API.LIGHT_MODES.FADE) {
                    handleLeds(api);
                }
                break;
            }

            if (api.updater !== undefined) {
                clearTimeout(api.updater);
                api.updater = undefined;
            }

            handleBrightness(0)
            break;
        case "brightness":
            if (state.brightness === 0) {
                state.power = false;
            }
            handleBrightness(state.brightness);
            break;
        case "light":
            if (state.lightState.isKelvin) {
                if (api.updater !== undefined) {
                    clearTimeout(api.updater);
                    api.updater = undefined;
                }
            }
            handleLeds(api);
            break;
        case "mode":
            if (api.updater !== undefined) {
                clearTimeout(api.updater);
                api.updater = undefined;
            }
            handleLeds(api);
            break;
    }
}

/**
 * WRONG OUTPUT, RGB > GRB
 */
class API {
    constructor() {
        this.updater;
        this.state = {
            temperature: 22,
            humidity: 50,
            power: true,
            brightness: 10,
            currentScene: undefined,
            lightState: {
                fade: {
                    init: false,
                    currentTick: 0,
                    currentColor: 0,
                    steps: []
                },
                rotate: {
                    offset: 0,
                    clockwise: true
                },
                isKelvin: false,
                kelvinIndex: 0,
                mode: API.LIGHT_MODES.FADE,
                duration: 5,
                colors: [new Color({ h:180, s:100, v:100}), new Color({ h:0, s:100, v:100})]
            }
        }

        this.render("init")
    }
    
    /**
     * Defining hardware state getters
     */
    get temperature() { return this.state.temperature }
    get humidity() { return this.state.humidity }
    get power() { return this.state.power }
    get brightness() { return Math.round(100 / 255 * this.state.brightness) }
    get kelvin() { return 1000000 / Math.round(this.state.lightState.colors[0].kelvin) }
    get hue() { this.state.lightState.colors[0].hue }
    get saturation() { this.state.lightState.colors[0].saturation }
    get colors() { this.state.lightState.colors }

    /**
     * Defining hardware state setters
     */
    setSensorInfo(readings) {
        this.state.temperature = readings.temperature;
        this.state.humidity = readings.humidity;
        global.io.emit("sensor", readings);
    }
    setPower(value, socketId) {
        if (value === this.power) return;

        this.state.power = value;
        this.emit("power", this.state.power, socketId);
        this.render("power")
    }
    setBrightness(value, socketId) {
        this.state.brightness = 2.55 * value;
        this.emit("brightness", value, socketId);
        this.render("brightness")
    }
    setDuration(value, socketId) {
        this.state.lightState.duration = Number(value);
        this.emit("duration", this.state.duration, socketId);
        this.render("mode");
    }
    setKelvin(value) {
        const kelvin = Math.round(1000000 / value);

        this.state.lightState = {
            ...this.state.lightState,
            mode: API.LIGHT_MODES.STATIC,
            isKelvin: true,
            kelvinIndex: 0
        };
        this.state.lightState.colors[0] = new Color(Color.kelvinToRgb(kelvin));
        
        // global.io.emit("colors", {
        //     isKelvin: true,
        //     kelvinIndex: 0,
        //     colors: this.state.lightState.colors
        // });

        this.render("kelvin")
    }
    setHue(value) {
        // const saturation = this.state.lightState.colors[0].saturation;
        // this.state.lightState = {
        //     ...this.state.lightState,
        //     mode: API.LIGHT_MODES.STATIC,
        //     isKelvin: false,
        //     colors: [new Color({h: value, s: saturation, v: 100})]
        // };

        this.render("hue")
    }
    setSaturation(value) {
        // this.state.lightState.colors[0].saturation = value;
    }

    setMode(value, socketId) {
        this.state.lightState.mode = API.LIGHT_MODES[value];
        if (value === API.LIGHT_MODES.FADE) {
            this.state.lightState.fade.init = false;
        } else if (value === API.LIGHT_MODES.ROTATE) {
            this.state.lightState.rotate.offset = 0;
        }

        this.emit("mode", this.state.lightState.mode, socketId);
        this.render("mode");
    }

    setRotateClockwise(value, socketId) {
        this.state.lightState.rotate.clockwise = value

        this.emit("rotateClockwise", this.state.lightState.rotate.clockwise, socketId);
        this.render("mode");
    }

    setColors(value, socketId) {
        this.state.lightState.colors = value.colors.map((color) => new Color(color["$"]));
        this.state.lightState.isKelvin = value.isKelvin;
        this.state.lightState.kelvinIndex = value.kelvinIndex;
        
        if (value.isKelvin) {
            this.state.lightState.mode = API.LIGHT_MODES.STATIC;
            this.emit("mode", this.state.lightState.mode);
        }

        this.emit("colors", value, socketId);
        this.render("light")
    }

    saveScene(scene, socketId) {
        const newScene = {
            background: scene.background,
            brightness: this.state.brightness,
            lightState: {
                mode: this.state.lightState.mode,
                isKelvin: this.state.lightState.isKelvin,
                kelvinIndex: this.state.lightState.kelvinIndex,
                colors: this.state.lightState.colors.map(color => color.hexString),
                duration: this.state.lightState.duration,
                rotate: {
                    clockwise: this.state.lightState.rotate.clockwise
                }
            }
        };

        global.scenes.push(`/${scene.name}`, newScene);
        this.emit("scene", scene, socketId);
    }

    setScene(sceneName) {
        const scene = global.scenes.getData(`/${sceneName}`);
        scene.lightState.colors = scene.lightState.colors.map(color => new Color(color));
        scene.lightState.rotate = {
            offset: 0
        };

        this.state = {
            ...this.state,
            ...scene
        }

        this.emit("sync", global.api);
        this.render("brightness")
        this.render("mode")
    }

    getSceneObject() {
        const obj = [];
        for (const [key, value] of Object.entries(global.scenes.getData("/"))) {
            obj.push({
                name: key,
                background: value.background
            });
        }
        return obj;
    }

    render(prop) {
        renderLeds(this, prop);
    }

    emit(event, value, socketId) {
        if (socketId === undefined) {
            global.io.emit(event, value);
        } else {
            io.sockets.sockets.get(socketId).broadcast.emit(event, value);
        }
    }

    /**
     * @override
     * Returns only object state and not other properties
     */
    toJSON() {
        return {
            ...this.state,
            brightness: this.brightness,
            scenes: this.getSceneObject()
        };
    }
};
API.LIGHT_MODES = { STATIC: 0, FADE: 1, ALTERNATING: 2, ROTATE: 3 }

module.exports = API
