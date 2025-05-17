<template>
  <div class="app-container">
    <el-drawer
      :title="parentTitle"
      :before-close="handleCloseParent"
      :visible.sync="syncParentDrawer"
      size="90%"
    >
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 95%; margin: 12px 0 0 20px"
      >
        <el-table-column label="序号" fixed="left" prop="id" type="index" sortable="custom" align="center" width="95px" />
        <el-table-column label="策略组" fixed="left" width="150px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.modelType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="策略名称" width="150px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.modelName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本描述" width="380px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.modelDesc }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.createdTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" width="120px" align="center">
          <template>
            <span>版本</span>
          </template>
        </el-table-column>
        <el-table-column label="变更人" width="120px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.operator }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding">
          <template>
            <el-button type="primary" size="mini" @click="childrenDrawer = true">操作</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

      <div>
        <el-drawer
          :title="childrenTitle"
          :append-to-body="true"
          :destroy-on-close="true"
          :before-close="handleCloseChildren"
          :visible.sync="childrenDrawer"
          size="85%"
        >
          <rule :model-id.sync="modelId" />
        </el-drawer>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { queryModelVersionList } from '@/api/model'
import Rule from '@/views/flow/components/rule/rule.vue'

export default {
  name: 'ModelVersionList',
  components: { Pagination, Rule },
  props: {
    parentDrawer: {
      type: Boolean,
      default: false,
      required: true
    },
    modelId: {
      type: Number,
      required: true
    },
    modelType: {
      type: String,
      required: true
    },
    modelName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      syncParentDrawer: this.parentDrawer,
      parentTitle: '模型版本列表',
      childrenDrawer: false,
      childrenTitle: '规则编辑',
      listQuery: {
        page: 1,
        limit: 10
      },
      list: [],
      total: 0,
      listLoading: true,
      treeData: []
    }
  },
  watch: {
    parentDrawer(val) {
      this.syncParentDrawer = val
    },
    syncParentDrawer(newVal) {
      if (newVal) {
        this.handleDrawerOpen() // 当抽屉打开时执行操作
      }
    }
  },
  methods: {
    handleCloseParent(done) {
      this.$confirm('确认关闭吗?')
        .then(_ => {
          this.syncParentDrawer = false
          this.$emit('update:parentDrawer', this.syncParentDrawer) // 通知父组件更新
          done()
        })
        .catch(_ => {})
    },
    handleCloseChildren(done) {
      this.$confirm('确认关闭吗?')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    handleDrawerOpen() {
      this.listLoading = true
      queryModelVersionList({ modelType: this.modelType, modelName: this.modelName }).then(response => {
        if (response.data !== null) {
          this.list = response.data.list
          this.total = response.data.total
        }
        this.listLoading = false
      })
    },
    getList() {
      this.handleDrawerOpen()
    }
  }
}

</script>

<style scoped>

</style>
