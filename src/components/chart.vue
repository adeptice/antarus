<template>
  <div class="graph">
    <p class="axisy">Напор (м)</p>
    <vue-chartist :data="dots" :options="options" type="Line"></vue-chartist>
    <p class="axisx">Расход (м³/ч)</p>
  </div>
</template>

<script>
  import VueChartist from 'v-chartist';

  export default {
    props:{
      dots: Object
    },
    components:{
      'vue-chartist': VueChartist
    },
    data () {
      return {
        options: {
          height: "450px",
          fullWidth: true,
          showPoint: true,
          chartPadding: {
              top: 60,
              right: 40,
              bottom: 40
          },
          axisY: {
            offset: 55,
            // onlyInteger: true,
            labelInterpolationFnc: (value) => {return value + ' м'}
          },
          axisX: {
            offset: 10
          }
        }
      }
    }
  }
</script>
<style>
  @import "chart.css";
</style>
