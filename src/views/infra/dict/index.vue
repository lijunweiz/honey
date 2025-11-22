<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.dictCode" placeholder="字典编码" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.dictValue" placeholder="字典名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="getList">刷新</el-button>
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
      <el-table-column label="字典编码" fixed="left" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dictCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字典值" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dictValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字典描述" min-width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字典状态" class-name="status-col" width="80px" align="center">
        <template slot-scope="{row}">
          <el-tag effect="dark" :type="row.status === 1 ? 'success':'danger'">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="small" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="small" @click="handleConfig(row)">配置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-drawer
      ref="drawer"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      direction="rtl"
      :before-close="handleCloseDrawer"
    >
      <div class="drawer-content">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 400px; ">
          <el-form-item label="字典编码" prop="dictCode">
            <el-input v-model="temp.dictCode" :disabled="dialogStatus==='update'" />
          </el-form-item>
          <el-form-item label="字典值" prop="dictValue">
            <el-input v-model="temp.dictValue" />
          </el-form-item>
          <el-form-item label="字典描述" prop="description">
            <el-input v-model="temp.description" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="字典状态" prop="status">
            <el-select v-model="temp.status" placeholder="请选择状态" class="filter-item" style="width: 120px;">
              <el-option v-for="item in dictStatusOptions" :key="item.status" :label="item.desc" :value="item.status" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="footer">
          <el-button style="width: 220px;" @click="cancelForm">取消</el-button>
          <el-button type="primary" :loading="loading" style="width: 220px; margin-left: 30px" @click="$refs.drawer.closeDrawer()">
            {{ loading ? '提交中 ...' : '确 定' }}
          </el-button>
        </div>
      </div>
    </el-drawer>
    <dict-item :parent-drawer.sync="parentDrawer" :dict-code="dictCode" :dict-value="dictValue" />
  </div>
</template>

<script>
import { fetchList, createDict, updateDict, fetchDictStatus } from '@/api/dict'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import DictItem from '@/views/infra/dict/item'

export default {
  name: 'Dict',
  components: { DictItem, Pagination },
  directives: { waves },
  filters: {
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
        id: undefined,
        dictCode: undefined,
        itemCode: undefined,
        itemName: undefined,
        itemValue: undefined
      },
      temp: {
        id: undefined,
        dictCode: undefined,
        dictValue: undefined,
        itemCode: undefined,
        itemName: undefined,
        itemValue: undefined,
        status: 0,
        sort: 0,
        description: '',
        timestamp: new Date()
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dictStatusOptions: [],
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        dictCode: [{ required: true, message: '字典编码不能为空', trigger: 'blur' }],
        dictValue: [{ required: true, message: '字典值不能为空', trigger: 'blur' }],
        itemCode: [{ required: true, message: '字典项编码不能为空', trigger: 'blur' }],
        itemName: [{ required: true, message: '字典项名称不能为空', trigger: 'blur' }],
        itemValue: [{ required: true, message: '字典项值不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '请选择字典状态', trigger: 'blur' }]
      },
      filterText: '',
      loading: false,
      timer: null,
      parentDrawer: false,
      dictCode: '',
      dictValue: ''
    }
  },
  created() {
    fetchDictStatus().then(response => {
      if (response.data !== null) {
        this.dictStatusOptions = response.data
      }
    })
    this.getList()
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
          this.list = response.data.list
          this.total = response.data.total
        }

        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {}
      this.temp.status = 1
      this.temp.sort = 1
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
          createDict(this.temp).then(() => {
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          updateDict(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleCloseDrawer() {
      if (this.loading) {
        return
      }
      this.$confirm('确定要提交吗？')
        .then(_ => {
          this.loading = true
          this.timer = setTimeout(() => {
            if (this.dialogStatus === 'create') {
              this.createData()
            } else {
              this.updateData()
            }
            // 动画关闭需要一定的时间
            setTimeout(() => {
              this.loading = false
            }, 400)
          }, 1000)
        })
        .catch(() => {
          this.resetTemp()
          this.dialogFormVisible = false
        })
    },
    cancelForm() {
      this.loading = false
      this.dialogFormVisible = false
      clearTimeout(this.timer)
    },

    handleConfig(row) {
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.parentDrawer = true
      this.dictCode = row.dictCode
      this.dictValue = row.dictValue
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
  .drawer-content {
    margin-left: 50px;
    height: 100%;
  }
  .footer {
    display: flex;
    position: fixed;
    bottom: 20px;
    text-align: center;
  }
</style>
