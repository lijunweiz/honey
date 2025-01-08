<template>
  <div class="app-container">
    <el-container>
      <el-aside width="300px">
        <el-input v-model="filterText" placeholder="搜索" />
        <el-tree
          ref="tree"
          :key="timestamp"
          class="filter-tree"
          node-key="id"
          :default-expanded-keys="defaultExpandedKeys"
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          style="overflow: auto; padding-top: 7px;"
          @node-contextmenu="clickMenu"
          @node-click="openNodeData"
          @check-change="handleCheckChange"
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
      <el-main style="padding: 0 0 0 10px;">
        <div class="filter-container" style="float: right; margin-bottom: 12px;">
          <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreateTreeNode(null, null)">添加</el-button>
        </div>
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          border
          fit
          highlight-current-row
          style="width: 100%; margin-top: 12px"
        >
          <el-table-column label="序号" fixed="left" prop="id" type="index" sortable="custom" align="center" width="95px" />
          <el-table-column label="模型类型" fixed="left" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.modelType }}</span>
            </template>
          </el-table-column>
          <el-table-column label="模型名称" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.modelName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="描述信息" width="380px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.modelDesc }}</span>
            </template>
          </el-table-column>
          <el-table-column label="作者" width="120px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.operator }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" @click="handleUpdate(row)">编排</el-button>
              <el-popconfirm title="确定发布吗？" style="margin: 0 10px;" @onConfirm="publishDataSource(row,$index)">
                <el-button slot="reference" size="mini" :disabled="row.dataSourceStatus!==0" type="success">发布</el-button>
              </el-popconfirm>
              <el-button slot="reference" size="mini">试算</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="30%">
          <el-form ref="dataForm" :rules="rules" :model="treeNode" label-position="left" label-width="85px" hide-required-asterisk style="width: 400px; margin-left:50px;">
            <el-form-item label="策略组">
              <el-input v-model="treeNode.modelType" :disabled="treeNode.isLeaf===1" />
            </el-form-item>
            <el-form-item v-show="treeNode.isLeaf===1" label="规则集名称">
              <el-input v-model="treeNode.modelName" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="treeNode.modelDesc" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入描述信息" />
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
import { createTreeNode, fetchModelData, updateTreeNode } from '@/api/model'

export default {
  data() {
    return {
      filterText: '',
      defaultExpandedKeys: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      tableKey: 0,
      timestamp: 0,
      list: [],
      total: 0,
      listLoading: true,
      showOptionMenuId: null,
      textMap: {
        create: '添加',
        update: '修改'
      },
      dialogStatus: 'create',
      dialogFormVisible: false,
      rules: {
        modelType: [{ required: true, message: '策略组不能为空', trigger: 'blur' }],
        modelName: [{ required: true, message: '规则集名称不能为空', trigger: 'blur' }],
        modelDesc: [{ required: true, message: '描述信息不能为空', trigger: 'blur' }]
      },
      treeNode: {
        modelId: undefined,
        modelType: '',
        modelName: '',
        isLeaf: undefined,
        modelDesc: '',
        operator: '',
        timestamp: null
      },
      treeNodeTemp: null
    }
  },
  watch: {
    activeName(val) {
      this.$router.push(`${this.$route.path}?tab=${val}`)
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    refresh() {
      fetchModelData().then(response => {
        if (response.data !== null) {
          this.list = response.data.list
          this.treeData = response.data.treeData
          if (this.defaultExpandedKeys.length === 0) {
            this.defaultExpandedKeys = Array.of(this.treeData[0].id)
          }
        }
        this.listLoading = false
      })
      this.$nextTick(() => {
        this.restoreExpandedNodes()
      })
    },
    restoreExpandedNodes() {
      // 在数据刷新后还原展开的节点
      this.$refs.tree.setCheckedKeys(this.defaultExpandedKeys)
    },
    handleCheckChange(data, checked, node) { // todo treedata刷新后须保持上次tree展开状态
      console.log(this.defaultExpandedKeys)
      // 节点选中状态变化时保存节点id
      if (checked) {
        this.defaultExpandedKeys.push(node.id)
      } else {
        const index = this.defaultExpandedKeys.indexOf(data.id)
        if (index > -1) {
          this.defaultExpandedKeys.splice(index, 1)
        }
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 共四个参数，依次为：event、传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身
    clickMenu(e, item, node, element) {
      console.log('click')
    },
    // 共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身
    openNodeData(item, node, element) {
      console.log(JSON.stringify(item) + '\n' + node.toString() + '\n' + element.toString())
    },
    showOptionMenuMethod(item, node, enter) {
      if (enter === 1) { // 鼠标进入
        this.showOptionMenuId = node.id
        console.log(JSON.stringify(item.data) + '\n' + JSON.stringify(node) + '\n' + enter)
      } else { // 鼠标离开
        this.showOptionMenuId = -1
        console.log('leave')
      }
    },
    createTreeNode() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.treeNode.operator = this.$store.getters.name
          this.treeNode.timestamp = new Date()
          createTreeNode(this.treeNode).then((response) => {
            console.log(JSON.stringify(response) + 'list.unshift: ' + JSON.stringify(this.list))
            this.timestamp = this.timestamp + 1// 刷新问题
            this.tableKey = this.tableKey + 1
            this.dialogFormVisible = false
            this.$notify({
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.refresh()
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
          updateTreeNode(this.treeNode).then((response) => {
            console.log(JSON.stringify(response) + 'list.unshift: ' + JSON.stringify(this.list))
            this.dialogFormVisible = false
            this.$notify({
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            this.refresh()
          })
        }
      })
    },
    showTreeNodeView(dialogStatus, data) {
      this.resetTreeNode()
      this.dialogStatus = dialogStatus
      this.dialogFormVisible = true
      this.treeNodeTemp = data
    },
    handleCreateTreeNode(node, data, e) {
      if (e !== undefined) {
        e.stopPropagation()// 禁止点击事件冒泡（阻止父组件响应点击事件）
      }
      this.resetTreeNode()
      if (node == null && data == null) { // 新增策略组
        this.treeNode.isLeaf = 0
      } else {
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
        if (node.isLeaf) {
          this.treeNode.modelType = node.parent.data.label
        } else {
          this.treeNode.modelType = node.data.label
        }
        this.treeNode.isLeaf = 1 // 新增叶子节点
      }

      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdateTreeNode(node, data, e) {
      e.stopPropagation()// 禁止点击事件冒泡（阻止父组件响应点击事件）
      this.resetTreeNode()
      this.treeNode.modelId = data.id
      if (node.isLeaf) {
        this.treeNode.modelType = node.parent.data.label
        this.treeNode.modelName = data.label
      } else {
        this.treeNode.modelType = data.label
      }
      this.treeNode.isLeaf = data.isLeaf
      this.treeNode.modelDesc = data.modelDesc
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    resetTreeNode() {
      this.treeNode = {
        modelType: '',
        modelName: '',
        isLeaf: undefined,
        modelDesc: '',
        operator: '',
        timestamp: null
      }
    },
    publishDataSource() {
      console.log('publishDataSource')
    }
  }
}
</script>
<style lang="scss" scoped>
  .model-tree-node{
    width: 100%;
  }

  .text-overflow {
    overflow: hidden;
    text-overflow: ellipsis; // 文本溢出添加省略号
    white-space: nowrap; // 碰到有边界不要折行
  }

</style>
