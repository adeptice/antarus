<template lang="html">
  <div class="graph">
    <img :src="image" />
  </div>
</template>

<script>
export default {
  props: { image: String }
}
</script>
