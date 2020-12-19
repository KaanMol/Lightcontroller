const IroColor = require("@irojs/iro-core").IroColor;
class Color extends IroColor {
    constructor(...args) {
        super(...args);
    }

    get int() {
        const {r,g,b} = this.rgb;
        return (g << 16) + (r << 8) + b
    }
}

module.exports = {
    Color
}