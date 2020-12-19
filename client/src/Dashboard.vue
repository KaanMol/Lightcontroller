<template>
  <main v-if="$store.getters.loaded">
    <ColorModal ref="colors"></ColorModal>
    <SceneModal ref="scenes"></SceneModal>
    <div id="welcome">
      <span class="title">Goedenavond</span>
      <span class="far fa-cog"></span>
    </div>
    <div class="card">
      <div class="temperature">
        <div class="room">
          <span class="far fa-thermometer-half"></span>
          <span class="value">{{$store.getters.temperature}}°C</span>
        </div>
        <div class="room">
          <span class="far fa-humidity"></span>
          <span class="value">{{$store.getters.humidity}}%</span>
        </div>
      </div>
    </div>
 
    <div class="card controls">
      <div id="power">
        <button @click="togglePower"><span class="far fa-lightbulb-on"></span></button>
        <button @click="openColorPicker"><span class="far fa-palette"></span></button>
        <button @click="openScenePicker"><span class="far fa-list"></span></button>
      </div>
      <div class="stack">
          <div class="row">
              <span>Helderheid</span>     
              <span>{{$store.getters.brightness}}%</span>
          </div>
          <input @input="setBrightness" type="range" min="1" max="100" v-bind:value="$store.getters.brightness" class="slider" id="myRange">
      </div>

      <span>Actie</span>
      <span class="actions">
          <button :class="{active: $store.getters.mode === 'STATIC'}" @click="() => setMode(0)">Statisch</button>
          <button :class="{active: $store.getters.mode === 'ALTERNATING'}" @click="() => setMode(2)">Alternerend</button>
          <button :class="{active: $store.getters.mode === 'FADE'}" @click="() => setMode(1)">Overgang</button>
          <button :class="{active: $store.getters.mode === 'ROTATE'}" @click="() => setMode(3)">Draaien</button>
      </span>

        <template v-if="$store.getters.mode === 'FADE' || $store.getters.mode === 'ROTATE'">
          <div class="stack">
              <div class="row">
                  <span>Animatieduur</span>     
                  <span>{{$store.getters.duration}} sec</span>
              </div>
              <input @input="setDuration" type="range" min="1" max="30" v-bind:value="$store.getters.duration" class="slider" id="myRange1">
          </div>
          </template>
          <template v-if="$store.getters.mode === 'ROTATE'">
            <span>Draairichting</span>
            <span class="actions">
              <button :class="{active: $store.getters.clockwiseRotation === false}" @click="() => setClockwiseRotation(false)">Links om</button>
              <button :class="{active: $store.getters.clockwiseRotation === true}" @click="() => setClockwiseRotation(true)">Rechts om</button>
            </span>
        </template>
<!-- 
      <div   class="group">
          
        <div class="row"><span></span> <span>{{}} sec</span></div>
        
      </div> -->
      <!-- <input type="text" v-model="sceneName">
      <button @click="saveScene">Save</button> -->
      <!-- {{$store.getters.power}}
      {{$store.getters.brightness}}
      {{$store.getters.duration}}
      {{$store.getters.mode}}
      {{$store.getters.kelvin}} -->
      
      <!-- <router-link to="/light">Licht</router-link> -->
 
    </div>
  </main>

  <main v-else>
    Verbinding aan het maken...
  </main>
</template>

<script>
import ColorModal from './PickerModal.vue'
import SceneModal from './SceneModal.vue'

export default {
  name: 'Dashboard',
  methods: {
    togglePower() {
      this.$store.dispatch("setPower", { power: !this.$store.getters.power });
    },
    setMode(mode) {
      this.$store.dispatch("setMode", { mode });
    },
    setDuration(event) {
      this.$store.dispatch("setDuration", { duration: event.target.value });
    },
    setBrightness(event) {
      this.$store.dispatch("setBrightness", { brightness: event.target.value });
    },
    setClockwiseRotation(clockwiseRotation) {
      this.$store.dispatch("setClockwiseRotation", { clockwiseRotation });
    },
    openColorPicker() {
      this.$refs.colors.openModal()
    },
    openScenePicker() {
      this.$refs.scenes.openModal()
    }
  },
  components: {
    ColorModal,
    SceneModal
  }
}
</script>

<style>
.temperature {
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
}

.room .far {
  grid-row: 1;
  font-size: 1.8em;
  margin-right: 15px;
}

.room .value {
  grid-row: 2;
  font-size: 2em;
}

.actions {
    display: grid;
    column-gap: 5px;
    grid-template-columns: 1fr 1fr;
    row-gap: 5px;
}

.actions > button, .color-controls > button {
    background: white;
    border: none;
    outline: 0;
    height: 35px;
    border-radius: 8px;
}

#power {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    column-gap: 15px;
}

#power > button {
    height: 50px;
    padding:0;
    width: 50px;
    font-size: 20px;
    outline: 0;
    background: white;
    border: none;
    border-radius: 100%;
}

.controls {
    display: grid;
    row-gap: 10px;
}

.stack {
    display: grid;
    grid-template-rows: min-content min-content;
}

.row {
    display: grid;
    grid-template-columns: 1fr max-content;
}

</style>
