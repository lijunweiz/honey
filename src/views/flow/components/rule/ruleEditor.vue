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
          :key="rule.id"
          :name="rule.id"
        >
          <template slot="title">
            <span>规则 {{ rIndex + 1 }}&nbsp;</span>
            <el-button type="text" @click.stop="removeRule(rIndex)">删除</el-button>
          </template>

          <!-- 条件编辑 -->
          <el-form label-width="80px" size="mini">
            <el-form-item label="条件">
              <condition-group :group="rule.condition" />
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
      <el-divider content-position="left">否则（兜底规则）</el-divider>
      <el-form size="mini" label-width="80px">
        <el-form-item label="兜底结果">
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
                <el-option label="=" value="=" />
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

export default {
  name: 'RuleEditor',
  components: { ConditionGroup },
  data() {
    return {
      activeRules: [],
      ruleSet: {
        rules: [],
        elseAction: {
          type: 'assign',
          field: 'decisionResult',
          operator: '=',
          value: 'PASS'
        }
      },
      actionFields: [
        { label: '授信等级', value: 'creditLevel', type: 'enum', options: ['A', 'B', 'C'] },
        { label: '授信额度', value: 'creditAmount', type: 'number' },
        { label: '决策结果', value: 'decisionResult', type: 'enum', options: ['PASS', 'REJECT'] }
      ]
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
  methods: {
    getFieldType(fieldValue) {
      const field = this.actionFields.find(f => f.value === fieldValue)
      return field ? field.type : 'string'
    },
    getFieldOptions(fieldValue) {
      const field = this.actionFields.find(f => f.value === fieldValue)
      return field ? field.options : []
    },
    addRule() {
      const id = Date.now() + Math.random()
      this.ruleSet.rules.push({
        id,
        condition: this.defaultConditionGroup(),
        action: { type: 'assign', field: '', operator: '=', value: '' }
      })
      this.activeRules.push(id)
    },
    removeRule(index) {
      this.ruleSet.rules.splice(index, 1)
    },
    defaultConditionGroup() {
      return {
        operator: 'AND',
        children: [
          { field: '', op: '==', value: '' }
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
      this.$message.success('处理成功')
      // this.$confirm('确认保存变更吗?').then(() => {
      //   const ruleSet = {
      //     'groupOperator': this.groupOperator,
      //     'ruleGroups': this.ruleGroups,
      //     'resultGroups': this.resultGroups
      //   }
      //   this.listLoading = true
      //   createRuleSet(ruleSet).then(() => {
      //     this.$message.success('处理成功')
      //     this.listLoading = false
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
