<template>
  <div class="condition-group">
    <div class="group-header">
      <el-select v-model="group.operator" size="mini" style="width:80px">
        <el-option label="并且" value="AND" />
        <el-option label="或者" value="OR" />
      </el-select>
      <el-button type="text" size="mini" @click="addCondition">+条件</el-button>
      <el-button type="text" size="mini" @click="addGroup">+条件组</el-button>
      <el-button type="text" size="mini" style="color:red" @click="removeGroup">删除组</el-button>
    </div>

    <div class="group-body">
      <div v-for="(item, i) in group.children" :key="i" class="group-item">
        <!-- 子条件组（递归） -->
        <condition-group
          v-if="item.children"
          :group="item"
          :variable-list="variableList"
          :parent="group"
          :index="i"
          :is-root="false"
        />

        <!-- 原子条件 -->
        <div v-else class="condition-item">
          <el-select v-model="item.field" placeholder="变量" size="mini" clearable filterable style="width: 300px">
            <el-option v-for="vl in variableList" :key="vl.variableNameEn" :value="vl.variableNameEn" :label="vl.variableNameZh" />
          </el-select>

          <el-select v-model="item.op" placeholder="操作符" size="mini">
            <el-option v-for="o in operators" :key="o.operator" :value="o.operator" :label="o.itemDesc" />
          </el-select>

          <el-input v-model="item.value" placeholder="值" size="mini" />

          <el-button type="text" size="mini" @click="removeCondition(index)">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRuleOperator } from '@/api/rule'

export default {
  name: 'ConditionGroup',
  props: {
    group: { type: Object, required: true },
    variableList: { type: Array, default: () => [] },
    parent: { type: Object, default: null },
    index: { type: Number, default: -1 },
    isRoot: { type: Boolean, default: false }
  },
  data() {
    return {
      operators: [
        { operator: '==', itemDesc: '等于' }
      ]
    }
  },
  created() {
    this.getOps()
  },
  methods: {
    getOps() {
      fetchRuleOperator({ 'type': 'compare' }).then(response => {
        if (response.data !== null && response.data.length > 0) {
          this.operators = response.data
        }
      }).catch(() => {
        console.warn('获取操作符列表失败，使用默认操作符')
      })
    },
    addCondition() {
      // 获取第一个操作符作为默认值，确保使用API返回的数据结构
      const defaultOperator = this.operators.length > 0 ? this.operators[0] : { operator: '==', itemDesc: '等于' }
      const condition = { field: '', op: defaultOperator.operator, itemDesc: defaultOperator.itemDesc, value: '' }
      this.group.children.push(condition)
    },
    addGroup() {
      // 获取第一个操作符作为默认值，确保使用API返回的数据结构
      const defaultOperator = this.operators.length > 0 ? this.operators[0] : { operator: '==', itemDesc: '等于' }
      this.group.children.push({
        operator: 'AND',
        children: [{ field: '', op: defaultOperator.operator, itemDesc: defaultOperator.itemDesc, value: '' }]
      })
    },
    removeCondition(index) {
      if (this.group.children.length <= 1) {
        this.$message.warning('至少保留一个条件')
        return
      }
      this.group.children.splice(index, 1)
    },
    removeGroup() {
      if (!this.parent) {
        this.$message.warning('根条件组不能删除')
        return
      }
      if (this.parent.children.length <= 1) {
        this.$message.warning('至少保留一个条件')
        return
      }
      this.parent.children.splice(this.index, 1)
    }
  }
}
</script>

<style scoped>
.condition-group {
  border-left: 2px solid #409EFF;
  padding-left: 8px;
  margin: 6px 0;
}
.group-header {
  margin-bottom: 4px;
}
.condition-item {
  display: flex;
  gap: 6px;
  margin: 4px 0;
}
</style>
