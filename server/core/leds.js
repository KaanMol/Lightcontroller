const leds = require('rpi-ws281x-native');
const NUM_LEDS = 60
leds.init(NUM_LEDS);
const pixelData = new Uint32Array(NUM_LEDS);
// module.exports = class Leds {
//     constructor() {
//         this
//     }
// }