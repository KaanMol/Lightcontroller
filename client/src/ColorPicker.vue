<template>
  <div style="box-sizing: border-box;max-width: 100vw;" ref="picker"></div>
</template>

<script>
import iro from "@jaames/iro";
export default {
  props: {
    initKelvin: {
      type: Boolean,
      default: false,
    },
    colors: {
      type: Array,
      default() {
        return [];
      },
    },
    value: {
      type: String,
      default: "#ffffff",
    },
    width: {
      type: Number,
      default: 300,
    },
    height: {
      type: Number,
      default: 300,
    },
    handleOrigin: {
      type: Object,
      default() {
        return {
          x: 0,
          y: 0,
        };
      },
    },
    padding: {
      type: Number,
      default: 6,
    },
    handleRadius: {
      type: Number,
      default: 8,
    },
    sliderMargin: {
      type: Number,
      default: 24,
    },
    sliderHeight: {
      type: Number,
      default: undefined,
    },
    borderWidth: {
      type: Number,
      default: 0,
    },
    borderColor: {
      type: String,
      default: "#ffffff",
    },
    display: {
      type: String,
      default: "block",
    },
    wheelAngle: {
      type: Number,
      default: 0,
    },
    wheelDirection: {
      type: String,
      default: "anticlockwise",
    },
    wheelLightness: {
      type: Boolean,
      default: true,
    },
    css: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
        handleFill: "#ffffff",
        kelvin: false,
        colorPicker: null,
    };
  },
  methods: {
    async toggleMode(mode) {
      if (this.kelvin === mode) return;

      this.kelvin = mode === undefined ? !this.kelvin : mode;
      this.colorPicker.setOptions(this.layoutOptions);

      if (this.kelvin) {
        await this.$nextTick();
        this.setHandleFill()
      }
    },
    setHandleFill() {
        let kelvinDegrees = this.colorPicker.color.kelvin;

        if (kelvinDegrees > 9000) {
          kelvinDegrees = 9000;
        } else if (kelvinDegrees < 4000) {
          kelvinDegrees = 4000;
        }

        this.$refs.picker.querySelector(`.IroHandle--isActive circle[r='${this.handleRadius}']`)
            .setAttribute("fill", new iro.Color(iro.Color.kelvinToRgb(kelvinDegrees)).hexString);
    },
    onInput(color) {
      this.$emit("input", color.hexString);
    },
    onColorChange(color, changes) {
      if (this.kelvin) {
          this.setHandleFill()
      }

      this.$emit("color-change", {
        color,
        changes,
      });
    },
    onColorInit() {
        this.colorPicker.setActiveColor(this.colorPicker.colors.length - 1)
        this.$emit("color-count", this.colorPicker.colors.length);
    },
    onColorRemove() {
        this.colorPicker.setActiveColor(this.colorPicker.colors.length - 1)
        this.$emit("color-count", this.colorPicker.colors.length);
    },
    onInputChange(color, changes) {
      this.$emit("input-change", {
        color,
        changes,
      });
    },
    onInputStart(color) {
      this.$emit("input-start", {
        color,
      });
    },
    onInputMove(color) {
      this.$emit("input-move", {
        color,
      });
    },
    onInputEnd(color) {
      this.$emit("input-end", {
        color,
      });
    },
    onMount(colorPicker) {
      this.$emit("mount", {
        colorPicker,
      });
    },
    onResize() {
      var style = getComputedStyle(this.$refs.picker, null);
      var width = Number(style.getPropertyValue("width").slice(0, -2));
      this.colorPicker.setOptions({ width })
    }
  },
  mounted() {
    var style = getComputedStyle(this.$refs.picker, null);
    var width = Number(style.getPropertyValue("width").slice(0, -2));

    this.kelvin = this.initKelvin;
    this.colorPicker = new iro.ColorPicker(this.$refs.picker, {
      colors: this.colors,
      width: width,
      height: this.height,
      color: this.value,
      padding: this.padding,
      ...this.layoutOptions,
      layoutDirection: "horizontal",
      display: this.display,
      css: this.css,
      wheelDirection: this.wheelDirection,
      wheelAngle: this.wheelAngle,
      wheelLightness: this.wheelLightness,
      handleOrigin: this.handleOrigin,
      handleRadius: this.handleRadius,
      sliderMargin: this.sliderMargin,
      sliderHeight: this.sliderHeight,
      borderWidth: this.borderWidth,
      borderColor: this.borderColor,
    });

    if (this.kelvin) {
        this.setHandleFill()
    }

    this.colorPicker.on("input:end", this.onInput);
    this.colorPicker.on("color:change", this.onColorChange);
    this.colorPicker.on("color:init", this.onColorInit);
    this.colorPicker.on("color:remove", this.onColorRemove);
    this.colorPicker.on("input:change", this.onInputChange);
    this.colorPicker.on("input:start", this.onInputStart);
    this.colorPicker.on("input:move", this.onInputMove);
    this.colorPicker.on("input:end", this.onInputEnd);
    this.colorPicker.on("mount", this.onMount);
    // window.addEventListener('resize', this.onResize);

    this.colorPicker.setActiveColor(this.$store.state.kelvinIndex)
    console.log(this.colorPicker)
  },
  beforeUnmount() {
    this.colorPicker.off("input:end", this.onInput);
    this.colorPicker.off("color:change", this.onColorChange);
    this.colorPicker.off("color:remove", this.onColorRemove);
    this.colorPicker.off("color:init", this.onColorInit);
    this.colorPicker.off("input:change", this.onInputChange);
    this.colorPicker.off("input:start", this.onInputStart);
    this.colorPicker.off("input:move", this.onInputMove);
    this.colorPicker.off("input:end", this.onInputEnd);
    this.colorPicker.off("mount", this.onMount);
    // window.removeEventListener("resize", this.onResize)
  },
  computed: {
    layoutOptions() {
        let options = {
            layout: [
                {
                component: iro.ui.Wheel,
                },
            ]
        }

      if (this.kelvin) {
        options = {
            layout: [
                {
                    component: iro.ui.Slider,
                    options: {
                        sliderType: "kelvin",
                        sliderShape: "circle",
                        minTemperature: 4000,
                        maxTemperature: 9000,
                        // activeIndex: this.$store.state.kelvinIndex
                    },
                },
            ]
        };
      }
      return options;
    },
  },
  watch: {
    value(newValue) {
      if (this.colorPicker.color) {
        this.colorPicker.color.hexString = newValue;
      }
    },
    '$store.state.colors'(value) {
      this.toggleMode(this.$store.state.kelvin);
      this.colorPicker.setColors(value.map(color => color.hexString));
      this.colorPicker.setActiveColor(this.$store.state.kelvinIndex)
      this.$emit("colorCount", this.colorPicker.colors.length)

      if (this.$store.state.kelvin) {
        this.setHandleFill();
      }
    }


  },
};
</script>

<style>
    .IroHandle circle[stroke="#000"] {
        position: absolute;
        stroke: rgba(0,0,0,0.2);
        stroke-width: 1;
    }

    .IroHandle circle[stroke="#fff"] {
      position: absolute;
        stroke-width: 1.5;
    }
</style>