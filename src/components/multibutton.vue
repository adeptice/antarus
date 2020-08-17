<template lang="html">
  <div class="button" :class="[{ 'selected': isActive, 'b_checkbox': isCheckbox }, view.class]" @click="wasClick">
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
    created() {
      if (this.isCheckbox && !this.isActive)
      this.$emit ("clicked", this.$props.model.change, this.$props.view.id, this.$props.model.role);
    },
    computed: {
      isCheckbox() {
        return (this.$props.model.role === "checkbox")
      },
      isActive() {
        if (this.$props.result) {
          if (typeof this.$props.result === "string") {
            return (this.$props.result === this.$props.view.id)
          } else {
            return (this.$props.result.indexOf(this.$props.view.id) > -1)
          }
        }
        return false
      }
    },
    methods: {
      wasClick(){
        this.$emit ("clicked", this.$props.model.change, this.$props.view.id, this.$props.model.role);
      }
    }
  }
</script>
