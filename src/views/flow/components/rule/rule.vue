<template>
  <div class="app-container">
    <el-container v-loading="listLoading">
      <el-aside width="200px">
        <el-tree
          ref="tree"
          class="filter-tree"
          :data="treeData"
          :props="defaultProps"
          style="overflow: auto;"
        >
          <div
            slot-scope="{ node, data }"
            class="model-tree-node"
          >
            <div :title="data.label" class="text-overflow" style="display: inline-block;width: 150px">{{ data.label }}</div>
          </div>
        </el-tree>
      </el-aside>
      <el-main style="padding-top: 0">
        <rule-editor :model-id="localModelId" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { fetchRuleList } from '@/api/rule'
import { fetchList } from '@/api/variable'
import RuleEditor from '@/views/flow/components/rule/ruleEditor.vue'

export default {
  name: 'Rule',
  components: { RuleEditor },
  props: {
    modelId: { type: Number, required: true }
  },
  data() {
    return {
      listLoading: false,
      localModelId: this.modelId,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      nextId: 1,
      variableList: [],
      variableTotal: -1
    }
  },
  watch: {
    modelId(val) {
      this.localModelId = val
    }
  },
  created() {
    console.log(this.localModelId)
    this.getList()
    this.getVariableList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchRuleList({ 'modelId': this.localModelId }).then(response => {
        if (response.data !== null) {
          console.log(JSON.stringify(response.data))
          if (response.data.treeData != null) {
            this.treeData = response.data.treeData
          }
        }
        this.listLoading = false
      })
    },
    getVariableList() {
      this.listLoading = true
      fetchList().then(response => {
        if (response.data !== null) {
          this.variableList = response.data.items
          this.variableTotal = response.data.total
        }
        this.listLoading = false
      })
    }
  }
}
</script>

<style scoped>
.global-operator {
  margin-bottom: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.global-operator label {
  font-weight: bold;
  margin-right: 10px;
}

.global-operator select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 280px;
}

</style>
