import Vue from 'vue'
import App from './App.vue'
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';
import Vuex from 'vuex'
import iro from "@jaames/iro";
import vmodal from 'vue-js-modal'

// const socket = io(window.location.hostname);
const socket = io("192.168.1.100");

import { preferences, setup } from "./store";

Vue.use(Vuex);
Vue.use(vmodal);

const MODES = [
  "STATIC",
  "FADE",
  "ALTERNATING",
  "ROTATE"
];  

const store = new Vuex.Store({
  modules: {
    preferences,
    setup
  },
  state: {
    gradientName: "Shifter",
    loaded: false,
    temperature: 0,
    humidity: 0,
    power: true,
    brightness: 0,
    kelvin: false,
    colors: [],
    mode: 0,
    kelvinIndex: 0,
    duration: 1,
    clockwiseRotation: true,
    scenes: [],
    activeScene: ""
  },
  mutations: {
    SOCKET_SYNC(state, value) {
      if (!value.isSetup) return;
      
      state.temperature = value.temperature;
      state.humidity = value.humidity;
      state.power = value.power;
      state.brightness = value.brightness;
      state.kelvin = value.lightState.isKelvin;
      state.kelvinIndex = value.lightState.kelvinIndex;
      state.duration = value.lightState.duration;
      state.clockwiseRotation = value.lightState.rotate.clockwise;
      state.colors = value.lightState.colors.map(color => {
        return new iro.Color(color["$"])
      });
      state.mode = MODES[value.lightState.mode],
      state.scenes = value.scenes;
      state.activeScene = value.activeScene;
      state.loaded = true;


    },
    SOCKET_POWER(state, value) {
      state.power = value;
    },
    SOCKET_BRIGHTNESS(state, value) {
      state.brightness = value;
    },
    SOCKET_MODE(state, value) {
      state.mode = MODES[value];
    },
    SOCKET_DURATION(state, value) {
      state.duration = value;
    },
    SOCKET_ISKELVIN(state, value) {
      state.isKelvin = value;
    },
    SOCKET_NEWSCENE(state, newScene) {
        const sceneExists = state.scenes.findIndex(scene => scene.name === newScene.name)

        if (sceneExists > -1) {
            const scenes = state.scenes;
            scenes[sceneExists] = newScene;
            state.scenes = [...scenes];
        } else {
            state.scenes.push(newScene);
        }

        state.activeScene = newScene.name;
    },
    SOCKET_REMOVESCENE(state, sceneName) {
        const sceneExists = state.scenes.findIndex(scene => scene.name === sceneName)
        if (sceneExists < 0) return;

        const scenes = state.scenes;
        scenes.splice(sceneExists, 1)
        state.scenes = [...scenes];
        state.activeScene = "";
    },
    SOCKET_ACTIVESCENE(state, sceneName) {
      state.activeScene = "";
      state.activeScene = sceneName;
    },
    SOCKET_COLORS(state, value) {
      if (value.self !== true) {
        state.colors = value.colors.map(color => {
          return new iro.Color(color["$"])
        });
      }

      state.kelvin = value.isKelvin;
      state.kelvinIndex = value.kelvinIndex;
    },
    SOCKET_CLOCKWISEROTATION(state, value) {
      state.clockwiseRotation = value;
    },
    SOCKET_SENSORUPDATE(state, value) {
      state.temperature = value.temperature;
      state.humidity = value.humidity;
    },
    SOCKET_DISCONNECT(state) {
      state.loaded = false;
    },
    SOCKET_CONNECT() {
      this._vm.$socket.client.emit("sync");
    }
  },
  actions: {
    setPower({ commit }, { power }) {
      this._vm.$socket.client.emit("power", power);
      commit("SOCKET_POWER", power)
    },
    setBrightness({ commit, state }, { brightness }) {
        if (brightness === "0") {
            this._vm.$socket.client.emit("power", false);
            commit("SOCKET_POWER", false)
        } else if (brightness !== 0 && !state.power) {
            this._vm.$socket.client.emit("power", true);
          commit("SOCKET_POWER", true)
        }

      this._vm.$socket.client.emit("brightness", brightness);
      commit("SOCKET_BRIGHTNESS", brightness)
    },
    setMode({ commit }, { mode }) {
      this._vm.$socket.client.emit("mode", MODES[mode]);
      commit("SOCKET_MODE", mode)
    },
    setDuration({ commit }, { duration }) {
      this._vm.$socket.client.emit("duration", duration);
      commit("SOCKET_DURATION", duration)
    },
    setColors({ commit }, values) {
      this._vm.$socket.client.emit("colors", values);
      values.self = true;
      commit("SOCKET_COLORS", values)
    },
    setColorsSelf({ commit }, values) {
      commit("SOCKET_COLORS", values)
    },
    setClockwiseRotation({ commit }, { clockwiseRotation }) {
      this._vm.$socket.client.emit("clockwiseRotation", clockwiseRotation);
      commit("SOCKET_CLOCKWISEROTATION", clockwiseRotation)
    },
    createScene({ commit }, scene) {
      this._vm.$socket.client.emit("createScene", scene);
      commit("SOCKET_NEWSCENE", scene)
    },
    editScene({ commit }, scene) {
        this._vm.$socket.client.emit("editScene", scene);
        commit("SOCKET_NEWSCENE", scene)
    },
    removeScene({ commit }, scene) {
        this._vm.$socket.client.emit("removeScene", scene);
        commit("SOCKET_REMOVESCENE", scene)
    },
    applyScene({ commit }, sceneName) {
      this._vm.$socket.client.emit("applyScene", sceneName);
      commit("SOCKET_ACTIVESCENE", sceneName)
    }
  }
});

Vue.use(VueSocketIOExt, socket, { store });

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
