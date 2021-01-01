const { calculateFade } = require("./fade");
const { Color } = require("./color");
const NUM_LEDS = global.db.getData("/system/pixelCount");
const TICKS = 200;
class LEDDriver {
    constructor() {
        this.leds;

        if (global.db.getData("/system/isProduction")) {
            this.leds = require('rpi-ws281x-native');
            this.leds.init(NUM_LEDS);


            process.on('SIGINT', () => {
                global.leds.leds.reset();
                process.nextTick(function () { process.exit(0); });
            });
        } else {
            this.leds = require('./led-facade')
        }

        this.isOn = false;
        this.pixelData = new Array(NUM_LEDS);
        this.animation;
        this.mode = LEDDriver.MODE.STATIC;
        this.colors = [];
        this.rotate = {
            clockwise: true
        }
        this.brightness = 0;
        this.duration = 5000;

        this.setBrightness(this.brightness);
        this.setColors(global.state.colors);
    }

    turnOff() {
        this.isOn = false;
        this.leds.setBrightness(0);
    }

    turnOn() {
        this.isOn = true;
        this.leds.setBrightness(this.brightness);
    }

    setDuration(duration) {
        this.duration = duration;
        this._render();
    }

    setBrightness(brightness) {
        this.brightness = brightness;
        this.leds.setBrightness(brightness);
    }

    setMode(mode) {
        if (typeof mode === "string") {
            this.mode = LEDDriver.MODE[mode];
        } else { 
            this.mode = mode;
        }
        
        if (this.mode === LEDDriver.MODE.ROTATE) {
            this.rotate.offset = 0;
        } else if (this.mode === LEDDriver.MODE.FADE) {
            this.fade = {
                currentTick: 0,
                currentColor: 0,
                steps: calculateFade(this.colors[0], this.colors[1])
            };
        }

        this._render();
    }

    setClockwiseRotation(value) {
        this.rotate.clockwise = value;
        this._render();
    }

    setColors(colors) {
        this.colors = colors.map(color => new Color(color["$"]));
        this._render();
    }

    _render() {
        this._clearAnimation();
        switch (this.mode) {
            case LEDDriver.MODE.STATIC:
                let breakpoint = Math.round(NUM_LEDS / this.colors.length);
                let colorIndex = 0;
                for (let i = 0; i < NUM_LEDS; i++) {
                    if (i !== 0 && i % breakpoint === 0) {
                        colorIndex++;
                    }
                    this.pixelData[i] = this.colors[colorIndex].int;
                }
                this.leds.render(this.pixelData);
                break;
            case LEDDriver.MODE.ALTERNATING:
                for (let i = 0; i < NUM_LEDS; i++) {
                    this.pixelData[i] = this.colors[i % this.colors.length].int;
                }
                this.leds.render(this.pixelData);
                break;
            case LEDDriver.MODE.ROTATE:
                this._animate(this._animationRotation);
                break;
            case LEDDriver.MODE.FADE:
                this._animate(this._animationFade);
                break;
        };
    }

    _animate(animationMethod) {
        const animation = () => {
            animationMethod.bind(this)()
            this.animation = setTimeout(animation, this.duration / TICKS);
        };
        animation();
    }

    _animationFade() {
        if (this.fade.currentTick < TICKS) {
            const currentColor = new Color(this.colors[this.fade.currentColor].hsv);
            const newValues = {
                h: currentColor.hsv.h + (this.fade.steps[0] * this.fade.currentTick),
                s: currentColor.hsv.s + (this.fade.steps[1] * this.fade.currentTick),
                v: currentColor.hsv.v + (this.fade.steps[2] * this.fade.currentTick)
            };

            newValues.h < 0 ? newValues.h+=360 : newValues.h;
            newValues.s < 0 ? newValues.s+=100 : newValues.s;
            newValues.v < 0 ? newValues.v+=100 : newValues.v;

            currentColor.hsv = newValues;

            for (let i = 0; i < NUM_LEDS; i++) {
                this.pixelData[i] = currentColor.int;
            }

            this.leds.render(this.pixelData);

            this.fade.currentTick++;
        }

        if (this.fade.currentTick === TICKS) {
            const newColor = (this.fade.currentColor + 1) % this.colors.length;
            this.fade = {
                currentTick: 0,
                currentColor: newColor,
                steps: calculateFade(this.colors[newColor], this.colors[(newColor + 1) % this.colors.length])
            }
        }
    }

    _animationRotation() {
        let breakpoint = NUM_LEDS / this.colors.length;
        let colorIndex = 0;
        for (let i = 0; i < NUM_LEDS; i++) {
            if (i !== 0 && i % breakpoint === 0) {
                colorIndex++;
            }

            if (this.rotate.clockwise) {
                this.pixelData[(i + this.rotate.offset) % NUM_LEDS] = this.colors[colorIndex].int;
            } else {
                this.pixelData[(NUM_LEDS - this.rotate.offset + i) % NUM_LEDS] = this.colors[colorIndex].int;
            }
        }

        this.rotate.offset = (this.rotate.offset + 1) % NUM_LEDS;

        this.leds.render(this.pixelData);
    }

    _clearAnimation() {
        if (this.animation !== undefined) {
            clearTimeout(this.animation);
            this.animation = undefined;
        }
    }
};

LEDDriver.MODE = { STATIC: 0, FADE: 1, ALTERNATING: 2, ROTATE: 3 }

module.exports = LEDDriver;
