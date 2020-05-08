<template>
  <div class="graph">
    <vue-chartist :data="dots" :options="options" type="Line"></vue-chartist>
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
            onlyInteger: true,
            showPoint: false,
            chartPadding: {
                top: 40,
                right: 40,
                bottom: 10
            }
        }
      }
    }
  }
</script>
<style>
  @import "chart.css";
</style>
