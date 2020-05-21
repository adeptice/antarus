<template lang="html">

  <div id="navbar">
    <div class="container">
      <div class="row">
        <div class="col-md-7 col-lg-8 col-12">

          <nav id="steps">
            <div v-for="slide in slideList" :key="slide.name" class="navitem" :class="slide.status" @click="goSlide(slide.num)">
              <div class="stepNum"><span>{{slide.num+1}}</span></div>
              <div class="stepInfo">{{slide.name}}</div>
            </div>
          </nav>

        </div>
        <div class="col-md-5 col-lg-4 col-12">
          <div v-if="next.name" class="bluebutton submit" :class="{'active': next.isActive}" @click="goNext">{{next.name}}</div>
          <a v-if="isDownload" :href="download" class="bluebutton download active" target="_blank">Сохранить предложение</a>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  export default {
    props: {
      slides: Array,
      current: Number,
      next: Object,
      download: String
    },
    computed: {
      slideList(){
        if (this.$props.slides){
          var slideList = [];
          this.$props.slides.forEach((slide, i) => {
            var status = (i < this.$props.current) ? "checked" : (i === this.$props.current) ? "active" : "";
            slideList.push({"num": i, "name": slide, "status": status})
          });
          return slideList
        }
        return false
      },
      isDownload(){
        if ((!this.$props.next.isActive) && (this.download.length > 0)) return true
        return false
      }
    },
    methods: {
      goSlide(num){
        if (num < this.$props.current) this.$emit("slide", num);
      },
      goNext(){
        if (this.$props.next.isActive) this.$emit("slide", this.$props.current+1);
      }
    }
  }
</script>
