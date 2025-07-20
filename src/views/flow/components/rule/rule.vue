<template>
  <div class="app-container">
    <el-container v-loading="listLoading">
      <el-aside>
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
            <div :title="data.label" class="text-overflow" style="display: inline-block;width: 180px">{{ data.label }}</div>
          </div>
        </el-tree>
      </el-aside>
      <el-main style="padding-top: 0">
        <div style="max-height: 80vh; overflow-y: auto">
          <!-- 全局逻辑运算符 -->
          <div v-if="ruleGroups.length > 1" class="global-operator" style="height: 70px">
            <label style="padding-left: 2px;">组间关系:</label>
            <el-select v-model="groupOperator" placeholder="请选择">
              <el-option value="并且" label="并且" />
              <el-option value="或者" label="或者" />
            </el-select>
          </div>

          <!-- 规则组列表 -->
          <div v-for="(group, groupIndex) in ruleGroups" :key="group.id" class="rule-group">
            <div class="group-header">
              <label style="padding-right: 10px;">组内关系:</label>
              <el-select v-model="group.operator" placeholder="请选择">
                <el-option value="并且" label="并且" />
                <el-option value="或者" label="或者" />
              </el-select>
              <button class="btn-remove" style="margin-left: 10px" @click="removeGroup(groupIndex)">×</button>
            </div>

            <div v-for="(condition, condIndex) in group.conditions" :key="condition.id" class="condition">
              <el-select v-model="condition.field">
                <el-option v-for="field in availableFields" :key="field" :value="field" :label="field" />
              </el-select>

              <el-select v-model="condition.operator" filterable placeholder="请选择">
                <el-option v-for="op in operators" :key="op" :value="op" :label="op" />
              </el-select>

              <el-input v-model="condition.value" style="width: 20%" />

              <div class="condition-actions">
                <button class="btn-remove" @click="removeCondition(groupIndex, condIndex)">×</button>
                <el-button
                  v-if="condIndex === group.conditions.length - 1"
                  class="btn-add"
                  @click="addCondition(groupIndex)"
                >
                  + 添加条件
                </el-button>
              </div>
            </div>
          </div>

          <!-- 规则结果集 -->
          <div v-if="ruleGroups.length > 0" class="rule-group">
            <el-tag>结果</el-tag>
            <div v-for="(group, groupIndex) in resultGroups" :key="group.id">
              <div v-for="(condition, condIndex) in group.conditions" :key="condition.id" class="condition">
                <el-select v-model="condition.field">
                  <el-option v-for="field in availableFields" :key="field" :value="field" :label="field" />
                </el-select>

                <el-select v-model="condition.operator" disabled>
                  <el-option key="等于" value="等于" label="等于" />
                </el-select>

                <el-input v-model="condition.value" style="width: 20%" />

                <div class="condition-actions">
                  <button class="btn-remove" @click="removeResultGroupsCondition(groupIndex, condIndex)">×</button>
                  <el-button
                    v-if="condIndex === group.conditions.length - 1"
                    class="btn-add"
                    @click="addResultGroupsCondition(groupIndex)"
                  >
                    + 添加结果
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="actions" style="height: 50px; line-height: 50px">
          <el-button class="btn-add-group" @click="addNewGroup">+ 添加规则组</el-button>
          <el-button v-if="ruleGroups.length > 0" class="btn-add-group" style="background-color: #409EFF;" @click="submit">+ 保存规则组</el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { fetchRuleOperator, fetchRuleList, createRuleSet } from '@/api/rule'
import { fetchList } from '@/api/variable'

export default {
  name: 'Rule',
  props: {
    modelId: {
      type: Number,
      required: true
    }
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
      groupOperator: '并且', // 规则组间逻辑关系
      ruleGroups: [],
      resultGroups: [],
      availableFields: ['age', 'score', 'location', 'gender'], // 可配置的字段列表
      operators: [], // 支持的操作符
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
    this.getOps()
    this.getList()
    this.getVariableList()
  },
  methods: {
    getOps() {
      this.listLoading = true
      fetchRuleOperator({ 'type': 'compare' }).then(response => {
        if (response.data !== null) {
          this.operators = response.data
        }
        this.listLoading = false
      })
    },
    getList() {
      this.listLoading = true
      fetchRuleList({ 'modelId': this.localModelId }).then(response => {
        if (response.data !== null) {
          console.log(JSON.stringify(response.data))
          if (response.data.treeData != null) {
            this.treeData = response.data.treeData
          }
          // if (response.data.ruleGroups != null) {
          //   this.ruleGroups = response.data.ruleGroups
          // }
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
    },
    addNewGroup() {
      this.ruleGroups.push({
        id: this.nextId++,
        operator: '并且',
        conditions: [this.createNewCondition()]
      })
      if (this.ruleGroups.length === 1) {
        this.resultGroups.push({
          id: this.nextId++,
          conditions: [this.createNewCondition()]
        })
      }
    },

    removeGroup(index) {
      this.ruleGroups.splice(index, 1)
      if (this.ruleGroups.length === 0) {
        this.resultGroups = []
      }
    },

    addCondition(groupIndex) {
      console.log('groupIndex:' + groupIndex)
      this.ruleGroups[groupIndex].conditions.push(this.createNewCondition())
    },

    removeCondition(groupIndex, condIndex) {
      if (this.ruleGroups[groupIndex].conditions.length === 1) {
        this.$message.warning('至少要有一个条件')
        return
      }
      this.ruleGroups[groupIndex].conditions.splice(condIndex, 1)
      // 当规则组集无元素，或只有一个规则组且无条件把规则集及结果集清空
      if (this.ruleGroups.length === 0 || (this.ruleGroups.length === 1 && this.ruleGroups[0].conditions.length === 0)) {
        this.ruleGroups = []
        this.resultGroups = []
      }
    },

    addResultGroupsCondition(groupIndex) {
      this.resultGroups[groupIndex].conditions.push(this.createNewCondition())
    },

    removeResultGroupsCondition(groupIndex, condIndex) {
      if (this.resultGroups[groupIndex].conditions.length === 1) {
        this.$message.warning('至少要有一个结果')
        return
      }
      this.resultGroups[groupIndex].conditions.splice(condIndex, 1)
    },

    createNewCondition() {
      return {
        id: this.nextId++,
        field: this.availableFields[0],
        operator: this.operators[0],
        value: ''
      }
    },

    submit() {
      this.$confirm('确认保存变更吗?').then(() => {
        const ruleSet = {
          'groupOperator': this.groupOperator,
          'ruleGroups': this.ruleGroups,
          'resultGroups': this.resultGroups
        }
        this.listLoading = true
        createRuleSet(ruleSet).then(() => {
          this.$message.success('处理成功')
          this.listLoading = false
        })
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

.rule-editor {
  max-width: 800px;
  margin: 20px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.rule-group {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.condition {
  display: flex;
  align-items: center;
  margin: 10px 0;
  gap: 10px;
}

.field-select, .operator-select {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.value-input {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
  max-width: 200px;
}

.condition-actions {
  display: flex;
  gap: 10px;
}

.btn-add, .btn-add-group {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-remove {
  background: #ff4444;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  margin-top: 20px;
}
</style>
