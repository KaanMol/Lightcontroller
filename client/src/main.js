import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Dashboard from './Dashboard.vue'
import Gradients from './GradientPicker.vue'
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';
import Vuex from 'vuex'
import iro from "@jaames/iro";
import vmodal from 'vue-js-modal'
const socket = io('192.168.1.47');
   
Vue.use(VueRouter)
Vue.use(Vuex);
Vue.use(vmodal);

const MODES = [
  "STATIC",
  "FADE",
  "ALTERNATING",
  "ROTATE"
];  

const store = new Vuex.Store({
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
    rotateClockwise: true,
    scenes: []
  },
  mutations: {
    SOCKET_SYNC(state, value) {
      console.log(value)
      state.loaded = true;
      state.temperature = value.temperature;
      state.humidity = value.humidity;
      state.power = value.power;
      state.brightness = value.brightness;
      state.kelvin = value.lightState.isKelvin;
      state.kelvinIndex = value.lightState.kelvinIndex;
      state.duration = value.lightState.duration;
      state.rotateClockwise = value.lightState.rotate.clockwise;
      state.colors = value.lightState.colors.map(color => {
        return new iro.Color(color["$"])
      });
      state.mode = MODES[value.lightState.mode],
      state.scenes = value.scenes;
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
    SOCKET_SCENE(state, scene) {
      state.scenes.push(scene);
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
    SOCKET_ROTATECLOCKWISE(state, value) {
      state.rotateClockwise = value;
    }
  },
  actions: {
    setPower({ commit }, { power }) {
      this._vm.$socket.client.emit("power", power);
      commit("SOCKET_POWER", power)
    },
    setBrightness({ commit }, { brightness }) {
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
    setRotateClockwise({ commit }, { rotateClockwise }) {
      this._vm.$socket.client.emit("rotateClockwise", rotateClockwise);
      commit("SOCKET_ROTATECLOCKWISE", rotateClockwise)
    },
    saveScene({ commit }, scene) {
      this._vm.$socket.client.emit("saveScene", scene);
      commit("SOCKET_SCENE", scene)
    },
    setScene(tmp, sceneName) {
      tmp 
      this._vm.$socket.client.emit("setScene", sceneName);
      // commit("SOCKET_SCENE", sceneName)
    }
  },
  getters: {
    loaded: state => {
      return state.loaded;
    },
    scenes: state => {
      return state.scenes;
    },
    duration: state => {
      return state.duration;
    },
    temperature: state => {
      return state.temperature;
    },
    humidity: state => {
      return state.humidity;
    },
    power: state => {
      return state.power;
    },
    brightness: state => {
      return state.brightness;
    },
    kelvin: state => {
      return state.kelvin;
    },
    kelvinIndex: state => {
      return state.kelvinIndex;
    },
    colors: state => {
      return state.colors;
    },
    mode: state => {
      return state.mode;
    },
    rotateClockwise: state => {
      return state.rotateClockwise;
    }
  }
});

Vue.use(VueSocketIOExt, socket, { store });

Vue.config.productionTip = false

// const Bar = { template: '<div>bar</div>' }
const routes = [
  { path: '/', component: Dashboard },
  { path: '/gradients', component: Gradients }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  mode: 'history',
  routes // short for `routes: routes`
})

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
