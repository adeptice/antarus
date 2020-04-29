<template lang="html">

  <div id="navbar">
    <div class="container">
      <div class="row">
        <div class="col-8">

          <nav id="steps">
            <div v-for="slide in slideList" :key="slide.name" class="navitem" :class="slide.status" @click="goSlide(slide.num)">
              <div class="stepNum"><span>{{slide.num+1}}</span></div>
              <div class="stepInfo">{{slide.name}}</div>
            </div>
          </nav>

        </div>
        <div class="col-4">
          <div class="submit" :class="{'active': next.isActive}" @click="goNext">{{next.name}}</div>
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
      next: Object
    },
    computed: {
      slideList(){
        var slideList = [];
        this.$props.slides.forEach((slide, i) => {
          var status = (i < this.$props.current) ? "checked" : (i === this.$props.current) ? "active" : "";
          slideList.push({"num": i, "name": slide, "status": status})
        });
        return slideList
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
