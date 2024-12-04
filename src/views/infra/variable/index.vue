<template>
  <div class="app-container">
    <el-container>
      <el-aside width="180px">
        <el-input v-model="filterText" placeholder="搜索" />
        <el-tree
          ref="tree"
          class="filter-tree"
          node-key="id"
          :default-expanded-keys="[-1]"
          :data="treeData"
          :props="defaultProps"
          accordion
          :filter-node-method="filterNode"
          style="overflow: auto; padding-top: 7px;"
        />
      </el-aside>
      <el-main style="padding: 0 0 0 10px;">
        <div class="filter-container">
          <el-input v-model="listQuery.variableNameEn" placeholder="变量英文" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-select v-model="listQuery.dataSourceType" class="filter-item" clearable filterable placeholder="请选择类型">
            <el-option v-for="item in dataSourceTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
          <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
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
          <el-table-column label="变量英文" fixed="left" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.variableNameEn }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变量中文" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.variableNameZh }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数据源" width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.dataSourceName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.dataSourceType }}</span>
            </template>
          </el-table-column>
          <el-table-column label="需求名称" min-width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.requirementName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变量描述" min-width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.variableDesc }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变量状态" class-name="status-col" width="80px" align="center">
            <template slot-scope="{row}">
              <el-tag effect="dark" :type="row.variableStatus===0||row.variableStatus===1 ? '' : (row.variableStatus===2 ? 'success':'danger')">
                {{ row.variableStatus | variableStatusFilter }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" align="center" width="140" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <el-dropdown size="medium" split-button type="primary">
                操作
                <el-dropdown-menu slot="dropdown" style="padding: 1px 0">
                  <el-dropdown-item style="padding: 0 0">
                    <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item style="padding: 0 0">
                    <el-button :disabled="row.variableStatus === 1 || row.variableStatus === 2" size="mini" type="success" @click="handleModifyStatus(row,2)">发布</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item style="padding: 0 0">
                    <el-button :disabled="row.variableStatus === 3" size="mini" type="danger" @click="handleModifyStatus(row,3)">停用</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item style="padding: 0 0">
                    <template>
                      <el-popconfirm title="确定删除吗？" @onConfirm="handleDelete(row,$index)">
                        <el-button slot="reference" :disabled="row.variableStatus === 4" size="mini" type="danger">删除</el-button>
                      </el-popconfirm>
                    </template>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" hide-required-asterisk style="width: 600px; margin-left:50px;">
            <el-form-item label="变量英文" prop="variableNameEn">
              <el-input v-model="temp.variableNameEn" :disabled="dialogStatus==='update'" />
            </el-form-item>
            <el-form-item label="变量中文" prop="variableNameZh">
              <el-input v-model="temp.variableNameZh" />
            </el-form-item>
            <el-form-item label="数据源类型">
              <el-select v-model="temp.dataSourceType" class="filter-item" filterable placeholder="请选择" :disabled="dialogStatus!=='create'" @change="fetchDataSourceNames">
                <el-option v-for="item in dataSourceTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据源名称">
              <el-select v-model="temp.dataSourceName" class="filter-item" filterable placeholder="请选择" :disabled="dialogStatus!=='create'">
                <el-option v-for="item in dataSourceNameOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="变量状态">
              <el-tag effect="dark" :type="temp.variableStatus===0||temp.variableStatus===1 ? '' : (temp.variableStatus===2 ? 'success':'danger')">
                {{ temp.variableStatus | variableStatusFilter }}
              </el-tag>
            </el-form-item>
            <el-form-item label="需求名称">
              <el-input v-model="temp.requirementName" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="temp.variableDesc" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" style="text-align:right;">
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
          </div>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { fetchList, fetchPv, createVariable, updateVariable, modifyStatus } from '@/api/variable'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import TabPane from '@/components/TabPane'
import { variableStatusMap, variableStatusFilter } from '@/filters'
import { fetchDataSourceTypes, fetchDataSourceNames } from '@/api/datasource'

export default {
  name: 'VariableManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    variableStatusFilter
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        variableSource: undefined,
        variableNameEn: undefined,
        dataSourceType: undefined,
        dataSourceName: undefined
      },
      variableStatusMap,
      dataSourceTypeOptions: [],
      dataSourceNameOptions: [],
      temp: {
        id: undefined,
        variableNameEn: '',
        variableNameZh: '',
        timestamp: new Date(),
        variableDesc: '',
        dataSourceId: undefined,
        dataSourceName: '',
        dataSourceType: '',
        variableStatus: 0,
        author: '',
        requirementName: '',
        updateTime: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      dialogPvVisible: false,
      rules: {
        variableNameEn: [{ required: true, message: '变量英文不能为空', trigger: 'blur' }],
        variableNameZh: [{ required: true, message: '变量中文不能为空', trigger: 'blur' }]
      },
      downloadLoading: false,
      filterText: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
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
    fetchDataSourceTypes().then(response => {
      if (response.data !== null && response.data.dataSourceTypeOptions !== undefined) {
        this.dataSourceTypeOptions = response.data.dataSourceTypeOptions
        this.treeData = [
          {
            id: -1,
            label: '类型',
            children: response.data.dataSourceTypeOptions.map(function(item, index) {
              return {
                id: index,
                label: item
              }
            })
          }
        ]
        this.listLoading = false
      }
    })
    this.getList()
    // init the default selected tab
    const tab = this.$route.query.tab
    if (tab) {
      this.activeName = tab
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        if (response.data !== null) {
          this.list = response.data.items
          this.total = response.data.total
        }

        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      modifyStatus({ 'variableNameEn': row.variableNameEn, 'author': row.author, 'variableStatus': status }).then(() => {
        row.variableStatus = status
        this.$notify({
          title: 'Success',
          message: status === 4 ? 'Delete Successfully' : 'Update Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: '',
        variableStatus: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.author = this.$store.getters.name
          this.temp.updateTime = new Date()
          createVariable(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.temp.updateTime = new Date()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateVariable(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    fetchDataSourceNames() {
      fetchDataSourceNames({ 'dataSourceType': this.temp.dataSourceType }).then(response => {
        if (response.data !== null) {
          this.dataSourceNameOptions = response.data.dataSourceNameOptions
        }
      })
    },
    handleDelete(row, index) {
      this.handleModifyStatus(row, 4)
      this.list.splice(index, 1)
      this.total = this.total - 1
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['变量英文', '变量中文', '变量描述', '变量状态', '更新时间']
        const filterVal = ['variableNameEn', 'variableNameZh', 'variableDesc', 'variableStatus', 'updateTime']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === '更新时间') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    handleClickTabs() {

    }
  }
}
</script>
<style lang="scss" scoped>
.line-overflow {
    white-space: nowrap;/*强制单行显示*/
    text-overflow: ellipsis;/*超出部分省略号表示*/
    overflow: hidden;/*超出部分隐藏*/
    width: 260px;/*设置显示的最大宽度*/
    display: inline-block;
    vertical-align: top
}
</style>
