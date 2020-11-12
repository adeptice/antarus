<template lang="html">
    <img :src="'data:image/png;base64,' + image" />
</template>

<script>
export default {
  props: { image: String }
}
</script>
