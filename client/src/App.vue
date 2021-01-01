<template>
    <div id="page" :theme="$store.state.preferences.uiTheme" :style="{ background }">
      <main v-if="$store.state.loaded">
        <ColorModal ref="colors"></ColorModal> 
        <SceneModal ref="scenes"></SceneModal>
        <SettingsModal ref="settings"></SettingsModal>

        <header>
          <span class="title">{{this.headerText}}</span>
          <span @click="openSettingsModal" class="far fa-cog"></span>
        </header>

        <section class="temperature">
          <div class="room">
            <span class="far fa-thermometer-half"></span>
            <span class="value">{{$store.state.temperature}}°C</span>
          </div>
          <div class="room">
            <span class="far fa-humidity"></span>
            <span class="value">{{$store.state.humidity}}%</span>
          </div>
        </section>
    
        <section class="controls">
          <div id="power">
            <button :class="{active: $store.state.power }" @click="togglePower">
                <span v-if="$store.state.power" class="far fa-lightbulb-on"></span> 
                <span v-else class="far fa-lightbulb"></span>
            </button>
            <button @click="openColorPicker"><span class="far fa-palette"></span></button>
            <button @click="openScenePicker"><span class="far fa-list"></span></button>
          </div>

          <div class="stack">
              <div class="row">
                  <span>Helderheid</span>     
                  <span>{{brightness}}%</span>
              </div>
              <input @input="setBrightness" id="test" type="range" min="0" max="100" v-bind:value="brightness" class="slider">
          </div>

            <template v-if="$store.state.power">
                <div class="stack">
                    <span>Actie</span>
                    <span class="actions">
                        <button :class="{active: $store.state.mode === 'STATIC'}" @click="() => setMode(0)">Statisch</button>
                        <button :class="{active: $store.state.mode === 'ALTERNATING'}" @click="() => setMode(2)">Alternerend</button>
                        <button :class="{active: $store.state.mode === 'FADE'}" @click="() => setMode(1)">Overgang</button>
                        <button :class="{active: $store.state.mode === 'ROTATE'}" @click="() => setMode(3)">Draaien</button>
                    </span>
                </div>

                <template v-if="$store.state.mode === 'FADE' || $store.state.mode === 'ROTATE'">
                <div class="stack">
                    <div class="row">
                        <span>Animatieduur</span>     
                        <span>{{$store.state.duration}} sec</span>
                    </div>
                    <input @input="setDuration" type="range" min="1" max="30" v-bind:value="$store.state.duration" class="slider">
                </div>
                </template>
                <template v-if="$store.state.mode === 'ROTATE'">
                    <span>Draairichting</span>
                    <span class="actions">
                    <button :class="{active: $store.state.clockwiseRotation === false}" @click="() => setClockwiseRotation(false)">Links om</button>
                    <button :class="{active: $store.state.clockwiseRotation === true}" @click="() => setClockwiseRotation(true)">Rechts om</button>
                    </span>
                </template>
            </template>
        </section>
      </main>
      <Loading v-else-if="!$store.state.loaded && $store.state.setup.completed" />
      <Setup v-else />
    </div>
</template>

<script>
import Loading from './components/Loading.vue'
import Setup from './components/Setup.vue'
import ColorModal from './PickerModal.vue'
import SceneModal from './SceneModal.vue'
import SettingsModal from './SettingsModal.vue'
import { getGradient } from "./utils"

export default {
    name: 'App',
    components: {
        Loading,
        Setup,
        ColorModal,
        SceneModal,
        SettingsModal
    },
    data() {
        return {
            modalOpen: false,
            headerText: "Goedemorgen"
        }
    },
    mounted() {
        const today = new Date()
        const curHr = today.getHours();

        if (curHr >= 6 && curHr < 12) {
            this.headerText = "Goedemorgen";
        } else if (curHr >= 12 && curHr < 18) {
            this.headerText = "Goedemiddag";
        } else {
            this.headerText = "Goedenavond";
        }
    },
    computed: {
        brightness() {
            if (this.$store.state.power) {
                return this.$store.state.brightness
            } else {
                return 0;
            }
        },
        background () {
            const type = this.$store.state.preferences.uiType;
            if (type === "gradient") {
                return getGradient(this.$store.state.preferences.uiOption);
            } else if (type === "white") {
                return `#f2f2f2`;
            } else {
                return `#1e1e1e`;
            }
        }
    },
    methods: {
        togglePower() {
            this.$store.dispatch("setPower", { power: !this.$store.state.power });
        },
        setMode(mode) {
            if (this.$store.state.activeScene !== "") {
                this.$store.dispatch("applyScene", "");
            }
            
            this.$store.dispatch("setMode", { mode });
        },
        setDuration(event) {
            if (this.$store.state.activeScene !== "") {
                this.$store.dispatch("applyScene", "");
            }
            
            this.$store.dispatch("setDuration", { duration: event.target.value });
        },
        setBrightness(event) {
            if (this.$store.state.activeScene !== "") {
                this.$store.dispatch("applyScene", "");
            }

            this.$store.dispatch("setBrightness", { brightness: event.target.value });
        },
        setClockwiseRotation(clockwiseRotation) {
            if (this.$store.state.activeScene !== "") {
                this.$store.dispatch("applyScene", "");
            }

            this.$store.dispatch("setClockwiseRotation", { clockwiseRotation });
        },
        openColorPicker() {
            this.modalOpen = true;
            this.$refs.colors.openModal()
        },
        openScenePicker() {
            this.modalOpen = true;
            this.$refs.scenes.openModal()
        },
        openSettingsModal() {
            this.modalOpen = true;
            this.$refs.settings.openModal()
        },
    }
}
</script>

<style lang="scss">
@import url('./assets/style/fa.css');
@import url('./assets/style/fonts.css');

@mixin light {
    --primary: #fafafa;
    --secondary: 	#fafafa;
    --background: rgba(229,229,229,0.5);
    --secondary-bg: rgba(229,229,229,0.7);
    --buttons: rgba(250,250,250,0.6);
    --modal-cards: rgba(255, 255, 255,0.4);
    --modal: rgba(255, 255, 255,0.4);
    --color: #000000;
}
 
@mixin dark {
    --primary:	#161618;
    --secondary: #282b30;
    --buttons: rgba(22,22,24,0.6);
    --background: rgba(45,45,48,0.4);
    --modal-cards: rgba(33,33,36,0.4);

    --secondary-bg: rgba(45,45,48,0.7);

    --modal: rgba(129,129,129 ,0.4);
    --color: white;
}

:root {
    --red: #D1152C;
    --box-shadow: 2px 3px 10px 0px rgba(0,0,0,0.15)
}

[theme="light"] {
  @include light;
}
 
[theme="dark"] {
  @include dark;
}

[theme="auto"] {
    @media (prefers-color-scheme: dark) {
        @include dark;
    }

    @media (prefers-color-scheme: light) {
        @include light;
    }
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
}

html, body, #page {
  width: 100%;
  touch-action: manipulation;
  font-size: 16px;
  height: 100vh;
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color);
} 

#page {
  position: fixed;
  top:0;
}

main {
    height: 100%; 
    overflow: auto;
    // padding-top: env(safe-area-inset-top);
    // padding-left: env(safe-area-inset-left);
    // padding-bottom: env(safe-area-inset-bottom);
    // padding-right: env(safe-area-inset-right);
    // padding-top:  !important;
    padding: calc(env(safe-area-inset-top,0) + 30px) 15px 0 15px;
    display: grid;
    row-gap: 20px;
    grid-template-columns: 1fr;
    grid-template-rows: min-content min-content min-content;
    grid-template-areas: "header"
                        "temperature"
                        "controls";
        &.setup {
            grid-auto-rows: min-content;
            grid-template-areas: "header"
                                "content";
        }
}

header {
    grid-area: header;
    display: grid;
    grid-template-columns: 1fr min-content;
    grid-auto-rows: min-content min-content, min-content;
    align-items: center;

    .title {
        font-size: 2em;
    }
    .far {
        font-size: 1.8em;
    }
}

section {
    box-shadow: var(--box-shadow);
    background: var(--background);
    border-radius: 12px;
    padding: 20px;
    backdrop-filter: blur(5px);
}


@media (min-width: 768px) {
    main {
        grid-template-columns: 60px 1fr 60px;
        grid-template-rows: min-content min-content min-content;
        grid-template-areas: ". header ."
                            ". temperature ."
                            ". controls .";

        &.setup {
            grid-template-rows: min-content min-content;
            grid-template-areas: ". header ."
                                ". content .";
        }
    }

    #modal {
        display: grid;
        grid-template-columns: 60px 1fr 60px;
        .vm--modal {
            grid-column: 2;
        }
    }
}

@media (min-width: 1024px) {
    main, #modal {
        grid-template-columns: 1fr 2fr 1fr;
    }
}

@media (min-width: 1280px) {
    main, #modal {
        grid-template-columns: auto 600px auto;
    }
}

input[type="text"] {
    color: var(--color);
    background: var(--buttons);
    border: none;
    border-radius: 8px;
    padding: 10px 15px;
    outline: 0;
    width: 100%;
    box-shadow: var(--box-shadow);
    font-size: 16px;
    &:focus {
        background: var(--primary)
    }
    &:disabled {
        opacity: 0.8;
    }
}

button {
    box-shadow: var(--box-shadow);
    font-size: 14px;
    outline: 0;
    background: var(--buttons);
    color: var(--color);
    border: none;
    border-radius: 8px;
    padding: 10px;
    transition: 350ms;
    &.active {
        background: var(--primary);
        font-weight: bold;
    }

    &:active {
      transition: 350ms;
      background: var(--primary);
    }

    &:disabled {
        opacity: 0.4;
    }
}

.danger {
    box-shadow: var(--box-shadow);
    background: #D1152C;
    padding: 15px;
    color: white;
    border-radius: 8px;
}

.warning {
    background: #FFCC00;
    color: black; 
    display: grid;
    grid-template-columns: 30px 1fr;
    align-items: center;
}

section.temperature {
  grid-area: temperature;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
}

.room {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    justify-items: center;
    align-content: center;

    .far {
        grid-row: 1;
        font-size: 1.8em;
    }

    .value {
        grid-row: 2;
        font-size: 2em;
    }
}

.actions {
    display: grid;
    column-gap: 5px;
    grid-template-columns: 1fr 1fr;
    row-gap: 5px;
}

.controls {
    grid-area: controls;
    display: grid;
    row-gap: 20px;
}

#power {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    column-gap: 15px;
    button {
        height: 50px;
        padding:0;
        width: 50px;
        font-size: 20px;
        border-radius: 100%;
    }
}

article {
    display: grid;
    grid-auto-rows: min-content;
    row-gap: 25px;

    div.title {
        font-weight: bold;
        font-size: 17px;
        margin-bottom: 10px;
        span {
            font-weight: normal;
            float: right;
        }
    }
    box-shadow: var(--box-shadow);
    padding: 15px;
    border-radius: 8px;
    background: var(--modal-cards);
}


.stack {
    display: grid;
    row-gap: 10px;
    grid-template-rows: min-content min-content;
}

.row {
    display: grid;
    grid-template-columns: 1fr max-content;
}

#modal { 
    box-sizing: content-box;
    margin-top: calc(env(safe-area-inset-top,0) + 20px);
    & > .vm--modal {
        border-radius: 12px;
        background: var(--modal);
        backdrop-filter: blur(10px);
        position: relative;
        display: grid;
        left: -1px !important;
        width: calc(100% + 1px) !important;
        & > div {
            position: absolute; 
            top: 0;
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-rows: 50px 1fr;
            > .header {
                padding: 5px;
                display: grid;
                grid-template-columns: 40px 1fr 40px;
                column-gap: 5px;
                align-items: center;
                >.title {
                    grid-column: 2;
                    font-size: 18px;
                    font-weight: bold;

                }

                button {
                    background: none;
                    box-shadow: none;
                }
            }
            .content {
                display: grid;
                row-gap: 10px;
                padding: 0px 15px;
                overflow: auto;
                max-height: calc(100% - 20px);
                grid-auto-rows: min-content;
            }

            span.filler {
                height: calc(40px + env(safe-area-inset-bottom));
            }
        }
    }
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
    transition: 350ms;
}

.slide-right-leave-to, .slide-left-enter {
    transform: translateX(+100%);
}

.slide-right-enter, .slide-left-leave-to {
    transform: translateX(-100%);
}

.slide-enter-active {
    animation: slide .35s;
}

.slide-leave-active {
    animation: slide .35s reverse;
}

@keyframes slide {
    0% {
        transform: translateY(100%);
    }
    100% {
        transform: translateY(0%);
    }
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 15px;
  background: var(--secondary-bg);
//   box-shadow: var(--box-shadow);
  outline: none;
  border-radius: 25px;
} 

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: var(--primary);
  cursor: pointer;
  border-radius: 100%;
  border: none;
}

.slider::-moz-range-thumb {
    border: none;
    border-radius: 100%;
    width: 25px;
    height: 25px;
    background: var(--primary);
    cursor: pointer;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
    border-radius: 12px;
  background: var(--background);
}

::-webkit-scrollbar-thumb {
    border-radius: 8px;
  background: var(--buttons);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}

</style>
