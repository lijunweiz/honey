<template>
  <div>
    <vue-json-pretty :path="'res'" :data="graphData" />
  </div>
</template>
<script>
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

export default {
  components: {
    VueJsonPretty
  },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    graphData: Object
  }
}
</script>
<style scoped>
</style>
