<template>
  <div class="rule-editor">
    <el-card shadow="never" style="float: left; width: 60%">
      <div slot="header" class="clearfix">
        <span>条件编辑器</span>
        <el-button style="float:right" type="primary" size="mini" @click="addRule">新增规则</el-button>
      </div>

      <el-collapse v-if="ruleSet.rules.length>0" v-model="activeRules" style="max-height: 60vh;overflow-y: auto;">
        <el-collapse-item
          v-for="(rule, rIndex) in ruleSet.rules"
          :key="rule.nodeId"
          :name="rule.nodeId"
        >
          <template slot="title">
            <span>规则 {{ rIndex + 1 }}&nbsp;</span>
            <el-button type="text" @click.stop="removeRule(rIndex)">删除</el-button>
          </template>

          <!-- 条件编辑 -->
          <el-form label-width="80px" size="mini">
            <el-form-item label="条件">
              <condition-group :group="rule.condition" :variable-list="variableList" :operators="operators" />
            </el-form-item>

            <!-- 结果 -->
            <el-form-item label="结果">
              <el-select v-model="rule.action.type" placeholder="动作类型">
                <!--<el-option label="拒绝" value="reject" />-->
                <!--<el-option label="通过" value="pass" />-->
                <el-option label="赋值" value="assign" />
              </el-select>

              <template v-if="rule.action.type === 'assign'">
                <el-row :gutter="8" style="margin-top:6px">
                  <!-- 字段选择 -->
                  <el-col :span="8">
                    <el-select v-model="rule.action.field" placeholder="选择字段" size="mini">
                      <el-option v-for="f in actionFields" :key="f.value" :label="f.label" :value="f.value" />
                    </el-select>
                  </el-col>
                  <!-- 操作符 -->
                  <el-col :span="4">
                    <el-select v-model="rule.action.operator" size="mini">
                      <el-option label="等于" value="=" />
                    </el-select>
                  </el-col>
                  <!-- 值 -->
                  <el-col :span="8">
                    <!-- 枚举值 -->
                    <el-select v-if="getFieldType(rule.action.field) === 'enum'" v-model="rule.action.value" placeholder="选择值" size="mini">
                      <el-option v-for="v in getFieldOptions(rule.action.field)" :key="v" :label="v" :value="v" />
                    </el-select>
                    <!-- 数值 -->
                    <el-input-number v-else-if="getFieldType(rule.action.field) === 'number'" v-model="rule.action.value" size="mini" :controls="false" />
                    <!-- 字符串 -->
                    <el-input v-else v-model="rule.action.value" size="mini" placeholder="输入值" />
                  </el-col>
                </el-row>
              </template>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <!-- ELSE 兜底规则 -->
      <el-divider content-position="left">否则</el-divider>
      <el-form size="mini" label-width="80px">
        <el-form-item label="结果">
          <el-select v-model="ruleSet.elseAction.type" size="mini">
            <el-option label="赋值" value="assign" />
          </el-select>
        </el-form-item>

        <template v-if="ruleSet.elseAction.type === 'assign'">
          <el-row :gutter="8">
            <el-col :span="8">
              <el-select v-model="ruleSet.elseAction.field" size="mini" placeholder="字段">
                <el-option v-for="f in actionFields" :key="f.value" :label="f.label" :value="f.value" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="ruleSet.elseAction.operator" size="mini">
                <el-option :label="ruleSet.elseAction.itemDesc" :value="ruleSet.elseAction.operator" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-select v-if="getFieldType(ruleSet.elseAction.field) === 'enum'" v-model="ruleSet.elseAction.value" size="mini">
                <el-option v-for="v in getFieldOptions(ruleSet.elseAction.field)" :key="v" :label="v" :value="v" />
              </el-select>
              <el-input-number v-else-if="getFieldType(ruleSet.elseAction.field) === 'number'" v-model="ruleSet.elseAction.value" size="mini" :controls="false" />
            </el-col>
          </el-row>
        </template>
      </el-form>
    </el-card>
    <!-- 伪代码预览 -->
    <el-card shadow="never" class="pseudo-card">
      <pre v-if="ruleSet.rules.length" class="pseudo-code" style="font-size: 16px; text-align: center;">规则预览</pre>
      <pre class="pseudo-code">{{ pseudoCode }}</pre>
    </el-card>
    <div class="actions">
      <el-button v-if="activeRules.length > 0" class="btn-add-group" @click="submit">+ 保存规则组</el-button>
    </div>
  </div>
</template>

<script>
import ConditionGroup from './conditionGroup.vue'
import { fetchList } from '@/api/variable'
import { fetchRuleOperator, getRuleSetDetail, updateRuleSet } from '@/api/rule'

export default {
  name: 'RuleEditor',
  components: { ConditionGroup },
  props: {
    ruleId: { type: Number, required: true },
    modelId: { type: Number, required: true }
  },
  data() {
    return {
      activeRules: [],
      lastActiveRules: [],
      ruleSet: {
        rules: [],
        elseAction: {
          type: 'assign',
          field: 'decisionResult',
          operator: '=',
          itemDesc: '赋值',
          value: '拒绝'
        }
      },
      actionFields: [
        // { label: '授信等级', value: 'creditLevel', type: 'enum', options: ['A', 'B', 'C'] },
        // { label: '授信额度', value: 'creditAmount', type: 'number' },
        { label: '决策结果', value: 'decisionResult', type: 'enum', options: ['通过', '拒绝'] }
      ],
      variableList: [],
      variableTotal: -1,
      operators: []
    }
  },
  computed: {
    pseudoCode() {
      if (!this.ruleSet.rules.length) return '暂无规则'
      let code = ''
      this.ruleSet.rules.forEach((rule, index) => {
        const prefix = index === 0 ? '如果' : '否则如果'
        code += `${prefix} ${this.renderCondition(rule.condition)}\n`
        code += `    则 ${this.renderAction(rule.action)}\n`
      })
      code += `否则\n    则 ${this.renderAction(this.ruleSet.elseAction)}`
      return code
    }
  },
  watch: {
    async ruleId(val) {
      // 离开时提示用户有未保存内容
      // if (this.activeRules.length !== this.lastActiveRules.length) {
      //   await this.submit()
      // }
      if (val === -1) {
        this.ruleSet.rules = []
        this.activeRules = [] // 同时清空展开的折叠项
        this.lastActiveRules = [] // 记录上一次的展开的折叠项
      } else {
        this.getRuleSetDetail()
      }
    }
  },
  created() {
    this.getAllVariableList()
    this.getOps()
    console.log('editor ruleId: ' + this.ruleId)
    if (this.ruleId === -1) {
      this.ruleSet.rules = []
    } else {
      this.getRuleSetDetail()
    }
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
    getFieldType(fieldValue) {
      const field = this.actionFields.find(f => f.value === fieldValue)
      return field ? field.type : 'string'
    },
    getFieldOptions(fieldValue) {
      const field = this.actionFields.find(f => f.value === fieldValue)
      return field ? field.options : []
    },
    getAllVariableList() {
      this.listLoading = true
      fetchList({ page: 1, limit: 100000 }).then(response => {
        if (response.data !== null) {
          this.variableList = response.data.items
          this.variableTotal = response.data.total
        }
        this.listLoading = false
      })
    },
    getRuleSetDetail() {
      const params = { 'ruleId': this.ruleId, 'modelId': this.modelId }
      getRuleSetDetail(params).then(response => {
        if (response.data !== null) {
          this.ruleSet = response.data.ruleContent
          // 重置activeRules数组，确保所有规则都展开
          this.activeRules = this.ruleSet.rules.map(rule => rule.nodeId)
          this.lastActiveRules = this.activeRules.slice() // 解决watch到变化 触发保存提示
        }
      })
    },
    addRule() {
      if (this.ruleId === -1 || this.modelId === -1) {
        this.$message.warning('请先选中具体规则')
        return false
      }
      const nodeId = crypto.randomUUID()
      this.ruleSet.rules.push({
        nodeId,
        condition: this.defaultConditionGroup(),
        action: { type: 'assign', field: '', operator: '=', itemDesc: '赋值', value: '' }
      })
      this.activeRules.push(nodeId)
    },
    removeRule(index) {
      this.ruleSet.rules.splice(index, 1)
    },
    defaultConditionGroup() {
      return {
        operator: 'AND',
        children: [
          { field: '', op: '==', itemDesc: '等于', value: '' }
        ]
      }
    },
    renderCondition(group) {
      const render = g => {
        return g.children
          .map(c => {
            if (c.children) {
              return '(' + render(c) + ')'
            }
            return `${c.field} ${c.op} ${c.value}`
          })
          .join(` ${g.operator} `)
      }
      return render(group)
    },
    renderAction(action) {
      if (action.type === 'assign') {
        if (action.field && action.operator && action.value !== undefined) {
          return ` ${action.field} ${action.operator} ${action.value}`
        }
        return ''
      }
      if (action.type === 'reject') return '拒绝'
      if (action.type === 'pass') return '通过'
      return ''
    },
    submit() {
      console.log('ruleSet: ' + JSON.stringify(this.ruleSet))
      this.$confirm('确认保存变更吗?').then(() => {
        this.listLoading = true
        const params = { 'ruleId': this.ruleId, 'modelId': this.modelId, 'ruleContent': this.ruleSet }
        updateRuleSet(params).then(() => {
          this.$message.success('处理成功')
          this.listLoading = false
        })
      })
      // return new Promise((resolve, reject) => {
      //   console.log('ruleSet: ' + JSON.stringify(this.ruleSet))
      //   this.$confirm('确认保存变更吗?').then(() => {
      //     this.listLoading = true
      //     const params = { 'ruleId': this.ruleId, 'modelId': this.modelId, 'ruleContent': this.ruleSet }
      //     updateRuleSet(params).then(() => {
      //       this.$message.success('处理成功')
      //       this.listLoading = false
      //       resolve() // 成功时调用resolve
      //     }).catch(_ => {
      //       this.listLoading = false
      //       // reject(error) // 失败时调用reject
      //     })
      //   }).catch(() => {
      //     // reject(new Error('用户取消保存'))
      //   })
      // })
    }
  }
}
</script>

<style scoped>
.rule-editor {
  padding: 16px;
}
.pseudo-card {
  background: #0b1d2a;
  max-height: 76.5vh;
  overflow-x: auto;
  overflow-y: auto;
  float: right;
  width: 40%;
}
.pseudo-code {
  color: #9cdcfe;
  line-height: 1.6;
  font-size: 12px;
}
.actions {
  margin-top: 20px;
  height: 50px;
  line-height: 50px;
}
.btn-add, .btn-add-group {
  background: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
