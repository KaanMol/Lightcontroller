<template>
  <div class="gradient" :style="backgroundStyle" @click.prevent="changeGradient(gradient)">
      <span>{{ gradient.name }}</span>
  </div>
</template>

<style scoped>
    .gradient {
        display: grid;
        align-content: center;
        height: 50px;
        border-radius: 12px;
        text-align: center;
        color: black;
    }
</style>

<script>
export default {
  name: 'palette',
  props: ['gradient', 'updateGradient'],
  computed: {
    backgroundStyle() {
      const colors = [...this.gradient.colors];
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