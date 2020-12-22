<template>
  <div class="gradient" :style="backgroundStyle" @click.prevent="changeGradient(gradient)">
      <span>{{ gradient.name }}</span>
  </div>
</template>

<style>
    .gradient {
        display: grid;
        align-content: center;
        height: 50px;
        border-radius: 8px;
        text-align: center;
        color: white;
        font-family: Source Code Pro,monospace;
        font-size: 13px;
        box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.15);
    }
</style>

<script>
export default {
  name: 'palette',
  props: ['gradient', 'updateGradient'],
  computed: {
    backgroundStyle() {
      const colors = this.gradient.colors.map(color => { 
          if (color[0] !==  "#") {
              return `#${color}`;
          }
          return color;
      });

      return {
        background: `linear-gradient(to top right, ${colors})`,
      };
    },
  },
  methods: {
    changeGradient(gradient) {
      this.updateGradient(gradient);
    },
  },
};
</script>