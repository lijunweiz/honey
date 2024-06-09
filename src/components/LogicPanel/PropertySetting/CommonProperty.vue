<template>
  <div>
    <el-form label-width="80px" :model="formData">
      <el-form-item label="名称">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: '',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    nodeData: Object,
    // eslint-disable-next-line vue/require-default-prop
    lf: Object || String
  },
  data() {
    return {
      formData: {
        name: ''
      }
    }
  },
  mounted() {
    const { properties, text } = this.$props.nodeData
    if (properties) {
      this.$data.formData = Object.assign({}, this.$data.formData, properties)
    }
    if (text && text.value) {
      this.$data.formData.name = text.value
    }
    if (text && text.value) {
      this.$data.text = text.value
    }
  },
  methods: {
    onSubmit() {
      const { id } = this.$props.nodeData
      this.$props.lf.setProperties(id, {
        ...this.$data.formData
      })
      console.log(6666, this.$data.formData)
      this.$props.lf.updateText(id, this.$data.formData.name)
      this.$emit('onClose')
    }
  }
}
</script>
<style scoped>
</style>
