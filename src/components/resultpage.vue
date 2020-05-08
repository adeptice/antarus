<template lang="html">

  <div class="slide">
    <div class="container">
      <h1 v-if="layout">{{layout.header}}</h1>
      <template>

        <ul id="propList">
          <li v-for="(proposal_name, p_index) in propNameList" :key="p_index" :class="checked[p_index]">
            <div class="propNum" @click="gotoProposal(p_index)"><span>{{p_index + 1}}</span></div>
            <div class="propName">{{proposal_name}}</div>
          </li>
        </ul>

        <div id="proposal">
          <div v-for="(proposal, p_index) in proposals" :key="proposal.name" class="station" :class="checked[p_index]">
            <div class="databox">

              <chart :dots="proposal.graph"></chart>

              <div class="data row">
                <div v-for="datablock in proposal.data" :key="datablock.header" class="datablock col-lg-12 col-md-6 col-12">
                  <h2>{{datablock.header}}</h2>
                  <ul>
                    <li v-for="record in datablock.records" :key="record.label">
                      <p class="label">{{record.label}}</p>
                      <p class="value">{{record.value}}</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="proposal.info" class="info" v-html="proposal.info"></div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>

</template>

<script>
  import chart from './chart.vue';

export default {
  props: {
    view: Object,
    layout: Object
  },
  components: { chart },
  data(){
    return{
      current_proposal: null,
      checked: [],
      token: ""
    }
  },
  updated(){
    if ((this.$props.view.token) && (this.token != this.$props.view.token)) {
      this.checked = [];
      this.current_proposal = null;
      this.token = this.$props.view.token;
    }
    if (this.current_proposal === null) if (this.$props.view.proposal) this.gotoProposal(0);
  },
  computed: {
    propNameList(){
      if (this.$props.view.proposal){
        var propList = [];
        this.$props.view.proposal.forEach( proposal => {
          propList.push(proposal.name)
        });
        return propList
      }
      return false
    },
    proposals(){
      if (this.$props.view.proposal) return this.$props.view.proposal
      return false
    }
  },
  methods: {
    propClass(index){
      var propClass = false;
      if (index === this.current_proposal) {
        propClass = "active";
      } else {
        if (this.checked.indexOf(index) > -1) propClass = "checked";
      }
      return propClass
    },
    gotoProposal(num){
      this.$set(this.checked, this.current_proposal, "checked");
      this.$set(this.checked, num, "active");
      this.current_proposal = num;
      this.$emit("selectproposal", this.$props.view.proposal[this.current_proposal].download)
    }
  }
}
</script>
