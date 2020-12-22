<template>
    <modal name="pickerModal"
            width="100%"
            height="100%"
            transition="slide"
            overlayTransition="fade"
            id="modal">
        <div>
            <div class="header">
                <span></span>
                <span class="title">Kleur kiezer</span>
                <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
            </div>

            <div class="content">
                <nav>
                    <button 
                        class="color"
                        :class="{active: !$store.state.kelvin}" 
                        :disabled="!$store.state.kelvin"
                        @click="toggleMode">
                        Kleur
                    </button>

                    <button 
                        class="temperature"
                        :class="{active: $store.state.kelvin}" 
                        :disabled="$store.state.kelvin"
                        @click="toggleMode">
                        Temperatuur
                    </button>

                    <div class="background"></div>
                </nav>
            
                <ColorPicker 
                    id="color-picker"
                    ref="picker"
                    v-bind:initKelvin="$store.state.kelvin"
                    v-bind:colors="$store.state.colors"
                    @color-change="colorHandler"
                    @color-count="colorCountHandler"
                    @input-end="stateHandler"
                    v-bind:handleRadius="25"
                    v-bind:padding="-15"
                ></ColorPicker>  

                <div v-if="!$store.state.kelvin" class="colors">
                    <!-- <div class="title">Kleuren</div> -->
                    <button :disabled="colorCount === 1" @click="removeColor"><i class="far fa-minus"></i></button>
                    <button @click="addColor"><i class="far fa-plus"></i></button>
                </div> 
            </div>
        </div>
    </modal>
</template>

<script>
import iro from '@jaames/iro';
import ColorPicker from './ColorPicker';

export default {
    name: 'Light',
    data() {
        return {
            colorCount: 1,
            isKelvin: false
        }
    },
    mounted() {
        this.colorCount = this.$store.state.colors.length;
    },
    methods: {
        colorCountHandler(count) {
            this.colorCount = count;
        },
        closeModal() {
            this.$modal.hide('pickerModal')
        },
        durationHandler() {
            this.$socket.client.emit("duration", this.duration);
        },
        openModal() {
            this.$modal.show('pickerModal')
        },
        addColor() {
            this.$refs.picker.colorPicker.addColor(new iro.Color("#ffffff"))

            this.$store.dispatch("setColors", { 
                isKelvin: false,
                colors: this.$refs.picker.colorPicker.colors,
                kelvinIndex: this.$refs.picker.colorPicker.color.index
            })
        },
        removeColor() {
            this.$refs.picker.colorPicker.removeColor(this.$refs.picker.colorPicker.colors.length - 1);
            this.colorHandler();
        },
        colorHandler() {
            let response =  {
                isKelvin: this.$refs.picker.kelvin,
                kelvinIndex: this.$refs.picker.colorPicker.color.index,
                colors: this.$refs.picker.colorPicker.colors
            }
            this.$store.dispatch("setColors", response)
        },
        stateHandler() {
            let response =  {
                isKelvin: this.$refs.picker.kelvin,
                kelvinIndex: this.$refs.picker.colorPicker.color.index,
                colors: this.$refs.picker.colorPicker.colors
            }
            this.$store.dispatch("setColorsSelf", response)
        },
        setMode(mode) {
            this.currentMode = mode;
            this.$socket.client.emit("mode", mode)
        },
        toggleMode() {
            this.$refs.picker.toggleMode();
            this.colorHandler();
        }
    },
    components: {
        ColorPicker
    }
}
</script>

<style lang="scss" scoped>

    nav {
        border-radius: 12px;
        background: var(--background);
        position: relative;
        z-index: 1;
        height: 50px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 5px;

        .background {
            // margin: 5px;
            height: 40px;
            grid-column: 1;
            grid-row: 1;
            z-index: -1;
            background: var(--primary);
            transition: 350ms;
            border-radius: 8px;
        }
        box-shadow: 2px 3px 10px 0px rgba(0,0,0,0.15);

        button { 
            height: 40px;
            padding: 0;
            // color: var(--color);
            // cursor: pointer;
            // border-radius: 8px;
            // outline: 0;
            // background: none;
            // border: none;
            grid-row: 1;
            box-shadow: none;
            background: none;
            // font-size: 14px;
            &.active {
                font-weight: 600;
                background: none;
            }
            &:disabled {
                opacity: 1;
            }
        }

        .color.active ~ .background {
            transform: translateX(0%);
        }

        .temperature.active ~ .background {
            transform: translateX(100%);
        }

        .color {
            grid-column: 1;
        }

        .temperature {
            grid-column: 2;
        }
    }

    #color-picker {
        position: relative;
        z-index: 1;
        align-self: center;
        display: block;
    }
    
    .content {
        // box-sizing: border-box;
        margin: 15px !important;
        overflow: hidden !important;
        max-height: calc(100% - env(safe-area-inset-top,0) - 80px) !important;
        display: grid;
        grid-template-rows: 50px 1fr 50px;
    }

    .colors {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 15px;
         & > div.title {
             grid-column: 1/2;
             margin-bottom: 10px;
        }
        button {
            grid-row: 2;
        }

    }
</style>
