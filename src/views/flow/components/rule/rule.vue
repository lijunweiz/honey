<template>
  <div class="app-container">
    <el-container v-loading="listLoading">
      <el-aside width="300px">
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
            @mouseenter="showOptionMenuMethod(node, data, 1)"
            @mouseleave="showOptionMenuMethod(node, data, 0)"
          >
            <div :title="data.label" class="text-overflow" style="display: inline-block;width: 180px">{{ data.label }}</div>
            <div v-show="showOptionMenuId===data.id" style="position: relative; z-index: 2000; float: right; width: 70px">
              <button type="button" class="el-button el-button--default" style="padding: 0;border: none" @click="handleCreateTreeNode(node, data, $event)">
                <i class="el-icon-plus" />
              </button>
              <button type="button" class="el-button el-button--default" style="padding: 0;border: none" @click="handleUpdateTreeNode(node, data, $event)">
                <i class="el-icon-edit" />
              </button>
            </div>
          </div>
        </el-tree>
      </el-aside>
      <el-main style="padding-top: 0">
        <rule-editor :model-id="localModelId" />
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="30%" append-to-body>
          <el-form ref="dataForm" :rules="rules" :model="treeNode" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
            <el-form-item label="规则集名称" prop="ruleName">
              <el-input v-model="treeNode.ruleName" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="treeNode.description" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入描述信息" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" style="text-align:right;">
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createTreeNode():updateTreeNode()">确认</el-button>
          </div>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { createRuleSet, fetchRuleList, updateRuleSet } from '@/api/rule'
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
      showOptionMenuId: null,
      textMap: {
        create: '添加',
        update: '修改'
      },
      dialogStatus: 'create',
      dialogFormVisible: false,
      rules: {
        ruleGroup: [{ required: true, message: '策略组不能为空', trigger: 'blur' }],
        ruleName: [{ required: true, message: '规则集名称不能为空', trigger: 'blur' }]
      },
      treeNode: {
        id: undefined,
        ruleGroup: undefined,
        ruleName: undefined,
        description: '',
        timestamp: new Date().getTime()
      }
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
    showOptionMenuMethod(item, node, enter) {
      if (enter === 1) { // 鼠标进入
        this.showOptionMenuId = node.id
        console.log('data: ' + JSON.stringify(item.data) + '\n' + 'node: ' + JSON.stringify(node) + '\n' + 'enter: ' + enter)
      } else { // 鼠标离开
        this.showOptionMenuId = -1
        console.log('leave')
      }
    },
    handleCreateTreeNode(node, data, e) {
      if (e !== undefined) {
        e.stopPropagation()// 禁止点击事件冒泡（阻止父组件响应点击事件）
      }
      this.resetTreeNode()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.treeNode.modelId = this.localModelId
      this.treeNode.ruleGroup = node.id

      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdateTreeNode(node, data, e) {
      e.stopPropagation()// 禁止点击事件冒泡（阻止父组件响应点击事件）
      this.resetTreeNode()
      this.treeNode.modelId = data.modelId
      this.treeNode.ruleGroup = data.ruleGroup
      this.treeNode.ruleName = data.ruleName
      this.treeNode.description = data.description

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleDeleteTreeNode(node, data, e) {
      e.stopPropagation()// 禁止点击事件冒泡（阻止父组件响应点击事件）
    },
    resetTreeNode() {
      this.treeNode = {
        id: undefined, // 更新用
        modelId: undefined,
        ruleGroup: undefined,
        ruleName: undefined,
        description: '',
        timestamp: undefined
      }
    },
    createTreeNode() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.treeNode.operator = this.$store.getters.name
          this.treeNode.timestamp = new Date().getTime()
          createRuleSet(this.treeNode).then((response) => {
            console.log(JSON.stringify(response))
            this.dialogFormVisible = false
            this.$notify({
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    updateTreeNode() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          console.log(JSON.stringify(this.treeNode))
          this.treeNode.operator = this.$store.getters.name
          this.treeNode.timestamp = new Date()
          updateRuleSet(this.treeNode).then((response) => {
            console.log(JSON.stringify(response))
            this.dialogFormVisible = false
            this.$notify({
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
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
