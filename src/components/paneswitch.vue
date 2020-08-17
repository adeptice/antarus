<template lang="html">
  <div class="switch pane_switch" :class="{'off': !setup }" @click="setValue">{{params.name}}<span></span></div>
</template>

<script>
export default {
  props: {
    params: Object,
    fields: Array,
    result: Object,
    idList: Object
  },
  data(){
    return{
      setup: false,
      fieldsHistory: []
    }
  },
  computed:{
    myFields(){
      var fields = []
      this.$props.fields.forEach( field => {
        fields.push(field.id)
      });
      return fields
    }
  },
  methods:{
    setValue(){
      this.setup = !this.setup
      if (this.setup) {
        this.$props.fields.forEach( (field, index) => {
          var value = this.$props.result[this.$props.idList[field.id].change];
          if (value) { this.$set(this.fieldsHistory, index, value) } else { this.$set(this.fieldsHistory, index, null) }
        });
        this.$props.fields.forEach( field => {
          this.$emit("filled", this.$props.idList[field.id].change, this.$props.params.value, this.$props.idList[field.id].role)
        });
      } else {
        this.$props.fields.forEach( (field, index) => {
          this.$emit("filled", this.$props.idList[field.id].change, this.fieldsHistory[index], this.$props.idList[field.id].role)
        });
      }
    }
  }
}
</script>
