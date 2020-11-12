<template lang="html">

  <div class="inputline">

    <div v-if=" model.role === 'input' " class="formline" :class="{'disabled': isDisabled}">
      <label :for="model.change">{{model.label}}</label>
      <div class="numtext">
        <input type="number" :id="model.change" v-model="result" :class="{'error': isError}" :disabled="isDisabled">
        <div v-if="view.units" class="units">
          <ul class="measure" :style="marginUnit">
            <li v-for="(unit, unitnum) in view.units" :key="unit.name" @click="selectUnits(unitnum+1)"><span>{{unit.name}}</span></li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if=" model.role === 'switch' " class="switch" :class="switchClass" @click="switchToggle">{{model.label}}<span></span></div>

  </div>

</template>

<script>
  export default {
    props: {
      model: Object,
      view: Object,
      results: Object
    },
    data(){
      return {
        result: null,
        unit: 0
      }
    },
    created(){
      if (this.$props.model.role === 'switch') this.result = false;
    },
    computed: {
      isDisabled(){
        return (this.$props.results[this.$props.model.change] === 'auto')
      },
      switchClass(){
        if (this.result === false) return "off";
        return false
      },
      isError() {
        var isError = false;
        if (this.$props.model.required) if (this.result >= 0.001) { isError = false } else { isError = true }
        return isError
      },
      marginUnit() { return "margin-top: " + (-40)*this.unit + "px;" },
      ratio() {
        var defaultRatio = 1;
        if (Object.prototype.hasOwnProperty.call(this.$props.view, "units")) defaultRatio = this.$props.view.units[this.unit].ratio;
        return defaultRatio
      }
    },
    methods: {
      selectUnits(num){
        if (num >= this.$props.view.units.length) num = 0;
        this.unit = num;
        this.pushResult();
      },
      switchToggle() { this.result = !this.result },
      pushResult(){
        var realResult;
        if (typeof this.result === 'boolean') {
          realResult = this.result
        } else {
          realResult = (this.result === '') ? null : Math.round((this.result*this.ratio)*1000)/1000
        }
        this.$emit("filled", this.$props.model.change, realResult, this.$props.model.role)
      }
    },
    watch:{
      result: function (value) {
        if (value < 0) this.result = null;
        this.pushResult();
      }
    }
  }
</script>
