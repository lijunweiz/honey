<template>
  <div class="property-dialog">
    <CommonProperty
      :node-data="nodeData"
      :lf="lf"
      @onClose="handleClose"
    />
  </div>
</template>
<script>
import CommonProperty from './CommonProperty'
// import User from './User.vue'

export default {
  name: 'PropertyDialog',
  components: {
    CommonProperty
    // User
  },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    nodeData: Object,
    // eslint-disable-next-line vue/require-default-prop
    lf: Object
  },
  data() {
    return {}
  },
  methods: {
    handleClose() {
      this.$emit('setPropertiesFinish')
    }
  }
}
</script>
<style>
.property-dialog{
  padding: 20px;
}
</style>
