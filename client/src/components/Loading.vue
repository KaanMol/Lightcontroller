<template>
    <div id="loading">
      <section>
        <span>
          <i class="loader far fa-spinner-third"></i>
          <span class="text">Verbinding aan het maken</span>
        </span>
      </section>
    </div> 
</template>

<script>
export default {
  name: 'Loading'
}
</script>

<style lang="scss" scoped>
#loading {
  height: 100%;
  padding: 0 15px;
  display: grid;
  align-content: center;
}

section {
  padding: 30px 30px !important;
}

@media (min-width: 768px) {
  #loading {
    grid-template-columns: 1fr max-content 1fr;

    section {
      padding: 30px 50px !important;
      grid-column: 2;
    }
  }
}

.loader {
  font-size: 25px;
  animation: spin 2s infinite linear;
}

#loading > section {
  justify-items: center;
  display: grid;
  column-gap: 15px;
  font-weight: bold;
}

#loading .text {
  position: relative; 
  top: -3px;
  margin-left: 20px;
} 

@keyframes spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
}
</style>
