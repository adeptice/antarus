<template lang="html">
  <div v-if="myElems.length > 0" class="switch" :class="{'off': !isAnyChoosen}" @click="clickSwitch">
    {{view.value}}<span></span>
  </div>
</template>

<script>
export default {
  props: {
    view: Object,
    elems: Array,
    result: Object,
    idList: Object
  },
  computed: {
    myElems(){
      var idList = [];
      this.$props.elems.forEach( element => {
        if (element.button) idList.push(element.button.id)
      });
      return idList
    },
    myChoosen(){
      return this.myElems.filter( id => {
        const $change = this.$props.result[this.$props.idList[id].change];
        if ($change) return [...$change].includes(id)
        return false
      })
    },
    isAnyChoosen(){
      return this.myChoosen.length > 0
    }
  },
  methods:{
    clickSwitch(){
      if (this.isAnyChoosen){
        this.myChoosen.forEach( id => {
          this.$emit ("clicked", this.$props.idList[id].change, id, this.$props.idList[id].role);
        });
      } else {
        this.myElems.forEach( id => {
          this.$emit ("clicked", this.$props.idList[id].change, id, this.$props.idList[id].role);
        });
      }
    }
  }
}
</script>
