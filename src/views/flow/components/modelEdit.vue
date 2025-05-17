<template>
  <div class="app-container">
    <el-container>
      <el-aside width="300px">
        <el-tree
          ref="tree"
          :key="timestamp"
          class="filter-tree"
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          style="overflow: auto; padding-top: 7px;"
        >
        </el-tree>
      </el-aside>
      <el-main style="padding: 0 0 0 10px;">
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

        <el-dialog>

        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'ModelEdit',
  data() {
    return {
      treeData: [],
      listQuery: {
        page: 1,
        limit: 10
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      tableKey: 0,
      timestamp: 0,
      list: [],
      total: 0,
      listLoading: true,
      dialogFormVisible: false
    }
  },
  methods: {

  }
}
</script>

<style scoped>

</style>
