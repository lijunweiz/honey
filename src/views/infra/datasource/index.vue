<template>
  <div class="app-container">
    <div class="filter-container">
      <div style="float: left">
        <el-button class="filter-item" style="margin-bottom: 12px;" type="primary" @click="handleAdd">新增</el-button>
      </div>
      <div style="float: right">
        <el-input v-model="dsQuery.dataSourceName" placeholder="请输入数据源名称" style="width: 180px;" clearable class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column label="数据源名称" width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.dataSourceName }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.dataSourceType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.dataSourceDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="调用地址">
        <template slot-scope="scope">
          <span>{{ scope.row.protocol.toString().toLowerCase() }}://{{ scope.row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :effect="scope.row.dataSourceStatus===0 ? 'plain' : 'light'">{{ scope.row.dataSourceStatus === 0 ? '新建' : '运行中' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-popconfirm title="确定发布吗？" style="margin-left: 10px;" @onConfirm="publishDataSource(row,$index)">
            <el-button slot="reference" size="mini" :disabled="row.dataSourceStatus!==0" type="success">发布</el-button>
          </el-popconfirm>
          <el-popconfirm title="确定删除吗？" style="margin-left: 10px;" @onConfirm="handleDelete(row,$index)">
            <el-button slot="reference" size="mini" type="danger">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-tabs v-model="activeName" type="card" style="margin-left: 30px;margin-right: 30px;">
        <el-tab-pane label="基本信息" name="basicInfo">
          <div>
            <el-form ref="basicInfoDataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" hide-required-asterisk style="width: 600px;height: 312px">
              <el-form-item label="数据源" prop="dataSourceName">
                <el-input v-model="temp.dataSourceName" :disabled="dialogStatus==='update'" aria-placeholder="请输入数据源名称" />
              </el-form-item>
              <el-form-item label="类型" prop="dataSourceType">
                <el-select v-model="temp.dataSourceType" :disabled="dialogStatus==='update'" placeholder="请选择数据源类型" clearable filterable class="filter-item" style="width: 150px;">
                  <el-option v-for="item in dataSourceTypeOptions" :key="item.itemCode" :label="item.itemValue" :value="item.itemCode" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-tag>{{ dialogStatus==='create' ? '新建' : '更新' }}</el-tag>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="temp.dataSourceDesc" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入描述信息" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align:right;">
              <el-button @click="dialogFormVisible = false">取消</el-button>
              <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="参数配置" name="paramsConfig">
          <div>
            <el-form ref="paramsConfigDataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 600px;height: 312px">
              <el-form-item label="通讯协议" style="display: inline-block;">
                <el-select v-model="temp.protocol" placeholder="通讯协议" class="filter-item" style="width: 150px;">
                  <el-option v-for="item in protocolOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item label="调用方法" style="display: inline-block;margin-left: 40px;">
                <el-select v-model="temp.method" placeholder="调用方法" class="filter-item" style="width: 150px;">
                  <el-option v-for="item in methodOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item label="请求路径">
                <el-input v-model="temp.address" />
              </el-form-item>
              <el-form-item label="查询参数">
                <el-input v-model="temp.queryParam" />
              </el-form-item>
              <el-form-item label="请求头">
                <el-input v-model="temp.headers" label="多个用逗号分割" />
              </el-form-item>
              <el-form-item label="请求体">
                <el-input v-model="temp.requestBody" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align:right;">
              <el-button @click="dialogFormVisible = false">取消</el-button>
              <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="提取变量" name="extractVariable">
          <div>
            <el-form ref="extractVariableDataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 600px;height: 312px">
              <el-form-item label="提取变量">
                <el-input v-model="temp.extractVariable" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入返回值中需要提取的变量名称, 多个变量用逗号分割" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align:right;">
              <el-button @click="dialogFormVisible = false">取消</el-button>
              <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import { fetchDataSourceTypes, fetchList, createDataSource, updateDataSource, publishDataSource } from '@/api/datasource'

export default {
  name: 'DataSource',
  data() {
    return {
      list: [],
      listLoading: true,
      dsQuery: {
        dataSourceName: ''
      },
      textMap: {
        update: '编辑',
        create: '添加'
      },
      activeName: 'basicInfo',
      dialogStatus: 'create',
      dialogFormVisible: false,
      rules: {
        dataSourceName: [{ required: true, message: '数据源名称不能为空', trigger: 'blur' }]
      },
      temp: {
        timestamp: new Date(),
        dataSourceName: '',
        dataSourceType: '',
        dataSourceStatus: 0,
        dataSourceDesc: '',
        protocol: '',
        method: '',
        address: '',
        queryParam: '',
        headers: '',
        requestBody: '',
        extractVariable: ''
      },
      protocolOptions: ['HTTP', 'HTTPS'],
      methodOptions: ['GET', 'POST'],
      dataSourceTypeOptions: []
    }
  },
  created() {
    fetchDataSourceTypes({ 'itemName': 'dataSourceType' }).then(response => {
      if (response.data !== null) {
        this.dataSourceTypeOptions = response.data
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
    getList() {
      this.listLoading = true
      fetchList(this.dsQuery).then(response => {
        if (response.data !== null && response.data.list !== undefined) {
          this.list = response.data.list
        }

        this.listLoading = false
      })
    },
    handleAdd() {
      this.reset()
      this.dialogStatus = 'create'
    },
    reset() {
      this.dialogFormVisible = true
      this.temp = {}
      this.$nextTick(() => {
        this.$refs['basicInfoDataForm'].clearValidate()
        this.$refs['paramsConfigDataForm'].clearValidate()
        this.$refs['extractVariableDataForm'].clearValidate()
      })
    },
    handleFilter() {
      this.getList()
    },
    handleUpdate(row) {
      this.reset()
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.temp.updateTime = new Date()
      this.dialogStatus = 'update'
    },
    publishDataSource(row, index) {
      publishDataSource({ 'dataSourceId': row.dataSourceId, 'dataSourceStatus': 1 }).then(() => {
        this.list[index].dataSourceStatus = 1
        this.$notify({
          message: '发布成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleDelete() {
      console.log('handleDelete')
    },
    validateForm() {
      this.$refs['basicInfoDataForm'].validate((valid) => {
        if (valid) {
          this.$refs['paramsConfigDataForm'].validate((valid) => {
            if (valid) {
              this.$refs['extractVariableDataForm'].validate((valid) => {
                if (valid) {
                  return true
                }
              })
            }
          })
        }
      })
      return false
    },
    createData() {
      if (this.validateForm()) {
        this.temp.author = this.$store.getters.name
        this.temp.timestamp = new Date()
        createDataSource(this.temp).then(() => {
          console.log('list.unshift: ' + JSON.stringify(this.list))
          this.getList()
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: '添加成功',
            type: 'success',
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
    },
    updateData() {
      if (this.validateForm()) {
        this.temp.author = this.$store.getters.name
        this.temp.timestamp = new Date()
        updateDataSource(this.temp).then(() => {
          this.getList()
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: '修改成功',
            type: 'success',
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
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
