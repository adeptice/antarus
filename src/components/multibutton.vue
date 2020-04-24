<template lang="html">
  <div class="button" :class="{ 'selected': isActive }" @click="wasClick">
    <img v-if="view.icon" :src="view.icon"><h2>{{model.value}}</h2>
  </div>
</template>

<script>
  export default {
    props: {
      model: Object,
      view: Object,
      result: [String, Array]
    },
    computed: {
      isActive() {
        if (typeof this.$props.result === "string") {
          return (this.$props.result === this.$props.model.value)
        } else {
          return (this.$props.result.indexOf(this.$props.model.value) > -1)
        }
      }
    },
    methods: {
      wasClick(){
        this.$emit ("clicked", this.$props.model.change, this.$props.model.value, this.$props.model.role);
      }
    }
  }
</script>
