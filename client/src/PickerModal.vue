<template>
    <modal  name="pickerModal"
            width="100%"
            height="100%"
            :shiftY="0"
            transition="slide"
            overlayTransition="fade"
            :styles="modalStyle">
        <div v-if="$store.getters.colors.length" class="modalContent">
            <div id="header">
                <span>Kleurenkiezer</span>
                <span class="far fa-times"></span>
            </div>
            <div class="tabs">
                <button 
                    :class="{active: !$store.getters.kelvin}" 
                    :disabled="!$store.getters.kelvin"
                    @click="toggleMode">
                    Kleur
                </button>

                <button 
                    :class="{active: $store.getters.kelvin}" 
                    :disabled="$store.getters.kelvin"
                    @click="toggleMode">
                    Temperatuur
                </button>
            </div>
            
            <div v-if="!$store.getters.kelvin" class="group-container">
                <div class="group">
                    <span>Kleuren</span>
                    <div class="color-controls">
                        <button @click="addColor">+</button>
                        <button :disabled="$store.getters.colors.length === 1" @click="removeColor">-</button>
                    </div> 
                </div>
            </div>
            <ColorPicker 
                id="color-picker"
                ref="picker"
                v-bind:initKelvin="$store.getters.kelvin"
                v-bind:colors="$store.getters.colors"
                @color-change="colorHandler"
                @input-end="stateHandler"
                v-bind:handleRadius="25"
                v-bind:padding="-18"
            ></ColorPicker> 
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
            isKelvin: false,
            modalStyle: {
                marginTop: "50px"
            }
        }
    },
    methods: {
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

<style>
 
    .modalContent {
        box-sizing: border-box;
        padding: 15px;
        display: grid;
        grid-template-rows: 50px min-content 1fr; 
        height: calc(100% - 50px);
        align-items: center;
    }

    .card.group-container {
        display: grid;
        row-gap: 20px;
    }

    .color-controls {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .group {
        display: grid;
        grid-template-rows: min-content min-content;
    }
   
 
    #color-picker {
        grid-row: 3;
        display: block;
    }
    
    .IroHandle circle[stroke="#000"] {
        stroke: rgba(0,0,0,0.2);
        stroke-width: 1;
    }

    .IroHandle circle[stroke="#fff"] {
        stroke-width: 1.5;
    }
/*     
    .colors {

    } */

    .tabs {
        background: lightgray;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 20px;
        padding: 2px;
        margin: 0 20px 0 20px;
        border-radius: 25px;
    }
    .tabs > button {
        height: 30px;
        border-radius: 25px;
        border: none;
        background: none;
        outline: 0;
    }

    .tabs > button.active {
        background: white;
        color: inherit;
        transition: 300ms;
    }

    .color {
        display: inline-block;
        min-height: 35px;
        min-width: 35px;
        border-radius: 50px;
    }


    .slide-enter-active {
        animation: bounce-in .35s;
    }

    .slide-leave-active {
        animation: bounce-in .35s reverse;
    }

    @keyframes bounce-in {
        0% {
            transform: translateY(100%);
        }
        100% {
            transform: translateY(0%);
        }
    }
</style>
