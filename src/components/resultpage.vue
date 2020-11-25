<template lang="html">

  <div class="slide">
    <div class="container">

      <template v-if="isResults">
        <ul id="propList">
          <li v-for="(proposal_name, p_index) in propNameList" :key="p_index" :class="checked[p_index]" @click="gotoProposal(p_index)">
            <div class="propNum"><span>{{p_index + 1}}</span></div>
            <div class="propName"><span>{{proposal_name}}</span></div>
          </li>
        </ul>

        <template v-if="showArrows">
          <div class="arrow aleft" :class="{'active':leftAllow}" @click="swipeProposal(0)">&#8592;</div>
          <div class="arrow aright" :class="{'active':rightAllow}" @click="swipeProposal(1)">&#8594;</div>
        </template>

        <div id="proposal">
          <div v-for="(proposal, p_index) in proposals" :key="proposal.name" class="station" :class="checked[p_index]">
            <div class="station-name">
              <h2>{{proposal.type}}</h2>
              <h1>{{proposal.name}}</h1>
            </div>
            <div class="databox">
              <div class="graph">
                <imageblob v-if="proposal.graph.image_gh" :image="proposal.graph.image_gh"/>
                <imageblob v-if="proposal.graph.image_npsh" :image="proposal.graph.image_npsh"/>
              </div>
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
            <div class="subinfo">
              <p>Для консультации, уточнения стоимости и&nbsp;заказа обращайтесь в&nbsp;ближайшее <a href="http://www.elitacompany.ru/home/contacts" target="_blank">отделение компании «Элита»</a></p>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="center">
          <img src="img\think.svg" class="not_found">
          <h1>Система не&nbsp;нашла для&nbsp;вас подходящих установок</h1>
          <h2>Не отчаивайтесь! Обратитесь к&nbsp;техническим специалистам Элиты!</h2>
        </div>
      </template>
    </div>
  </div>

</template>

<script>
  // import chart from './chart.vue';
  import imageblob from './imageblob.vue'

export default {
  props: {
    view: Object,
    layout: Object
  },
  // components: { chart },
  components: { imageblob },
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
    if (this.current_proposal === null){
      if (this.$props.view.proposal)
        if (this.$props.view.proposal.length > 0) {
          window.ym(69332305, 'reachGoal', 'GOT_RESULTS');
          this.gotoProposal(0);
        } else {
          window.ym(69332305, 'reachGoal', 'NO_RESULTS');
        }
    }
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
    total_proposals(){
      if (this.$props.view.proposal) return this.$props.view.proposal.length
      return false
    },
    isResults(){
      return (this.total_proposals > 0)
    },
    leftAllow(){
      return (this.current_proposal > 0)
    },
    rightAllow(){
      return (this.current_proposal < this.total_proposals-1)
    },
    proposals(){
      if (this.$props.view.proposal) return this.$props.view.proposal
      return false
    },
    showArrows(){
      if (this.$props.view.proposal) return (this.$props.view.proposal.length > 1)
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
      let $proposal = this.$props.view.proposal[this.current_proposal].pdf || "";
      this.$emit("selectproposal", $proposal)
    },
    swipeProposal(direction){
      if (direction > 0) {
        if (this.rightAllow) this.gotoProposal(this.current_proposal+1)
      } else {
        if (this.leftAllow) this.gotoProposal(this.current_proposal-1)
      }
    }
  }
}
</script>
