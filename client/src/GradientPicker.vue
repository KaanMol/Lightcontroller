<template>
  <main>
    <div class="shortlist">
      <template v-for="item in shortlists">
        <div class="item" :key="item.name" :style="`backgroundColor: ${item.color}`" @click="filterGradients(item.name)" :class="{ active: isActiveShortlist(item.name)}">
          <a href="#" class="shortlist__link" v-if="currentFilter === item.name" @click.prevent.stop="clearFilter()">
            clear
          </a>
        </div>
      </template>
    </div>

    <div class="pallette-list">
      <Palette
        v-for="(gradient, index) in filteredGradients"
        :key="`${gradient}${index}`" 
        :gradient="gradient"
        :updateGradient="emit" />

    </div>
  </main>
</template>

<style scoped>
.shortlist {
  display: inline-block;
  overflow: scroll;
}

.shortlist > .item{
  display: inline-block;
  height: 35px;
  width: 35px;
}

.pallette-list{
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 15px;
  column-gap: 15px;;
}
</style>

<script>

import Palette from './Palette';
import gradients from "./gradients.json"
import detect from "./colorDetector"
export default {
    name: 'Dashboard',
    data() {
      return {
        currentFilter: false,
        shortlists: [
          { name: 'reds', color: '#cb2d3e' },
          { name: 'oranges', color: '#d76b26' },
          { name: 'yellows', color: '#ffd200' },
          { name: 'greens', color: '#159957' },
          { name: 'cyans', color: '#1cb5e0' },
          { name: 'blues', color: '#155799' },
          { name: 'magentas', color: '#ef32d9' },
          { name: 'whites', color: '#eaeaea' },
          { name: 'grays', color: '#c0c0cb' },
          { name: 'blacks', color: '#333333' },
        ],
      };
    },
    computed: {
      filteredGradients() {
        if (this.currentFilter) {
          switch (this.currentFilter) {
            case 'reds':
              return this.redPalettes;
            case 'oranges':
              return this.orangePalettes;
            case 'yellows':
              return this.yellowPalettes;
            case 'greens':
              return this.greenPalettes;
            case 'cyans':
              return this.cyanPalettes;
            case 'blues':
              return this.bluePalettes;
            case 'magentas':
              return this.magentaPalettes;
            case 'whites':
              return this.whitePalettes;
            case 'grays':
              return this.greyPalettes;
            case 'blacks':
              return this.blackPalettes;
            default:
              break;
          }
        }
        return this.classifiedColors;
      },
      classifiedColors() {
        gradients.forEach((gradient) => {
          const tags = [];
          gradient.colors.forEach(color => tags.push(detect(color)));
          /* eslint-disable no-param-reassign */
          gradient.palletes = tags;
        });
        return gradients;
      },
      filterPalettes() {
        return color => this.classifiedColors.filter(gradient => gradient.palletes.includes(color));
      },
      cyanPalettes() {
        return this.filterPalettes('Cyans');
      },
      redPalettes() {
        return this.filterPalettes('Reds');
      },
      orangePalettes() {
        return this.filterPalettes('Oranges');
      },
      yellowPalettes() {
        return this.filterPalettes('Yellows');
      },
      greenPalettes() {
        return this.filterPalettes('Greens');
      },
      bluePalettes() {
        return this.filterPalettes('Blues');
      },
      magentaPalettes() {
        return this.filterPalettes('Magentas');
      },
      blackPalettes() {
        return this.filterPalettes('Blacks');
      },
      whitePalettes() {
        return this.filterPalettes('Whites');
      },
      greyPalettes() {
        return this.filterPalettes('Grays');
      },
    },
    methods: {
      isActiveShortlist(color) {
        return (this.currentFilter === color);
      },
      emit(test) {
        this.$emit("background", test)
      },
      clearFilter() {
        this.filterGradients(false);
      },
      filterGradients(name) {
        this.currentFilter = name;
      },
    },
    components: {
        Palette
    },
}
</script>

<style>

</style>
