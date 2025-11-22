<template>
  <div class="app-container">
    <el-drawer
      ref="dictItemDrawer"
      :title="dictValue"
      :before-close="handleCloseParent"
      :visible.sync="syncParentDrawer"
      direction="rtl"
      size="52%"
    >
      <div style="margin: 0 50px 0 50px">
        <div class="filter-container">
          <el-button class="filter-item" style="margin: 20px 0 20px 0;" type="primary" size="middle" icon="el-icon-edit" @click="handleCreate()">新增</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="getList">刷新</el-button>
        </div>
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          border
          fit
          highlight-current-row
        >
          <el-table-column label="字典项编码" fixed="left" width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.itemCode }}</span>
            </template>
          </el-table-column>
          <el-table-column label="字典项名称" width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.itemName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="字典项值" width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.itemValue }}</span>
            </template>
          </el-table-column>
          <el-table-column label="字典状态" class-name="status-col" width="80px" align="center">
            <template slot-scope="{row}">
              <el-tag effect="dark" :type="row.status === 1 ? 'success':'danger'">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button type="primary" size="small" @click="handleUpdate(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
      </div>
    </el-drawer>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="35%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" hide-required-asterisk style="width: 400px; margin-left:50px;">
        <el-form-item label="字典项编码" prop="itemCode">
          <el-input v-model="temp.itemCode" :disabled="dialogStatus==='update'" />
        </el-form-item>
        <el-form-item label="字典名称" prop="itemName">
          <el-input v-model="temp.itemName" :disabled="dialogStatus==='update'" />
        </el-form-item>
        <el-form-item label="字典值" prop="itemValue">
          <el-input v-model="temp.itemValue" />
        </el-form-item>
        <el-form-item label="字典状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择状态" class="filter-item" style="width: 120px;">
            <el-option v-for="item in dictStatusOptions" :key="item.status" :label="item.desc" :value="item.status" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align:right; margin-right: 50px">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchItemList, createDictItem, updateDictItem, fetchDictItemStatus } from '@/api/dict'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'DictItem',
  components: { Pagination },
  directives: { waves },
  filters: {},
  props: {
    parentDrawer: {
      type: Boolean,
      default: false,
      required: true
    },
    dictCode: {
      type: String,
      required: true
    },
    dictValue: {
      type: String,
      required: true
    }
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
        dictCode: undefined,
        itemCode: undefined,
        itemName: undefined,
        itemValue: undefined
      },
      temp: {
        dictCode: undefined,
        itemCode: undefined,
        itemName: undefined,
        itemValue: undefined,
        status: 0,
        sort: 0,
        description: '',
        timestamp: new Date()
      },
      syncParentDrawer: this.parentDrawer,
      dictStatusOptions: [],
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        itemCode: [{ required: true, message: '字典项编码不能为空', trigger: 'blur' }],
        itemName: [{ required: true, message: '字典项名称不能为空', trigger: 'blur' }],
        itemValue: [{ required: true, message: '字典项值不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '请选择字典状态', trigger: 'change' }]
      },
      filterText: '',
      loading: false,
      timer: null,
      dialogFormVisible: false,
      dialogStatus: 'create'
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
  created() {
    fetchDictItemStatus().then(response => {
      if (response.data !== null) {
        this.dictStatusOptions = response.data
      }
    })
    this.getList()
  },
  methods: {
    handleCloseParent() {
      this.syncParentDrawer = false
      this.$emit('update:parentDrawer', this.syncParentDrawer) // 通知父组件更新
    },
    handleDrawerOpen() {
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.listQuery.dictCode = this.dictCode
      fetchItemList(this.listQuery).then(response => {
        if (response.data !== null) {
          this.list = response.data.list
          this.total = response.data.total
        }
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        dictCode: undefined,
        itemCode: undefined,
        itemName: undefined,
        itemValue: undefined,
        status: 1,
        sort: 1,
        description: '',
        timestamp: new Date()
      }
    },
    handleCreate() {
      this.resetTemp()
      this.temp.dictCode = this.dictCode
      this.temp.dictValue = this.dictValue
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleConfirm() {
      console.log('handleConfirm called, dialogStatus:', this.dialogStatus)
      if (this.dialogStatus === 'create') {
        this.createDataItem()
      } else {
        this.updateDataItem()
      }
    },
    createDataItem() {
      console.log('createDataItem called, temp:', JSON.stringify(this.temp))
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createDictItem(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(() => {
            this.$notify({
              title: 'Error',
              message: '添加失败',
              type: 'error',
              duration: 2000
            })
          })
        } else {
          this.$notify({
            title: 'Warning',
            message: '请检查数据',
            type: 'warning',
            duration: 2000
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
    updateDataItem() {
      console.log(JSON.stringify(this.temp))
      // 临时移除禁用字段的验证规则
      const originalRules = this.rules
      const updateRules = {
        itemValue: [{ required: true, message: '字典项值不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '请选择字典状态', trigger: 'change' }]
      }
      this.rules = updateRules
      this.$refs['dataForm'].validate((valid) => {
        // 恢复原始验证规则
        this.rules = originalRules
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp)
          updateDictItem(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(() => {
            this.$notify({
              title: 'Error',
              message: '修改失败',
              type: 'error',
              duration: 2000
            })
          })
        } else {
          this.$notify({
            title: 'Warning',
            message: '请检查数据',
            type: 'warning',
            duration: 2000
          })
        }
      })
    },
    handleDelete(row) {
    }
  }
}
</script>
<style lang="scss" scoped>
.line-overflow {
  white-space: nowrap; /*强制单行显示*/
  text-overflow: ellipsis; /*超出部分省略号表示*/
  overflow: hidden; /*超出部分隐藏*/
  width: 260px; /*设置显示的最大宽度*/
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
