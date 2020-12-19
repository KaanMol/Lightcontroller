<template>
  <div id="app">

    <router-view v-if="$store.getters.loaded"></router-view>

    <!-- {{$store.getters.lightState}}
    {{$store.getters.brightness}} -->
    <!-- {{$store.getters.colorTemperature}} -->
    <!-- <button v-on:click="updateLightState">Toggle Power</button>
    <input type="range" min="0" max="100" v-model="brightnessInput" v-on:input="updateBrightness"> -->
    
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    this.$socket.client.emit("sync");
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');
@import url('./assets/style/fa.css');

html, body, #app {
  touch-action: manipulation;
  margin: 0;
  padding: 0;
  font-size: 16px;
  box-sizing: content-box;
  height: 100vh;
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#app {
  padding: 30px 15px 0 15px;
  background: #bc4e9c; /* fallback for old browsers */
  background: -webkit-linear-gradient(to top right, #bc4e9c, #f80759); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to top right, #bc4e9c, #f80759); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

}

main {
  display: grid;
  row-gap: 20px;
  grid-template-columns: 1fr;
  grid-template-rows: 40px min-content min-content;
}

#welcome {
  /* opacity: 80%; */
  font-size: 1em;
  /* color: white; */
  display: grid;
  grid-template-columns: 1fr min-content;
  align-items: center;
}

#welcome > .title {
  font-size: 2em;
}

#welcome > .far {
  font-size: 1.8em;
}

div.card {
  border-radius: 12px;
  padding: 20px;
  background: rgba(255,255,255,0.60);
  backdrop-filter: blur(5px);
}

</style>
