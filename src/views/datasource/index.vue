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
      <el-table-column align="center" label="编号" width="95">
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
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="调用地址">
        <template slot-scope="scope">
          <span>{{ scope.row.protocol.toString().toLowerCase() }}://{{ scope.row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag type="" effect="dark">{{ scope.row.status === 0 ? '新建' : '已发布' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="success" @click="handleModifyStatus(row,7)">发布</el-button>
          <el-popconfirm title="确定删除吗？" style="margin-left: 10px;" @onConfirm="handleDelete(row,$index)">
            <el-button slot="reference" size="mini" type="danger">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-tabs v-model="activeName" type="card" style="margin-left: 30px;margin-right: 30px;">
        <el-tab-pane label="基本信息" name="basicInfo">
          <div>
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" hide-required-asterisk style="width: 600px;height: 312px">
              <el-form-item label="数据源" prop="dataSourceName">
                <el-input v-model="temp.dataSourceName" aria-placeholder="请输入数据源名称" />
              </el-form-item>
              <el-form-item label="类型" prop="dataSourceType">
                <el-select v-model="temp.dataSourceType" placeholder="请选择数据源类型" clearable class="filter-item" style="width: 150px;">
                  <el-option v-for="item in dataSourceTypeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-tag v-if="dialogStatus==='create'">新建</el-tag>
                <el-tag v-if="dialogStatus==='update'">更新</el-tag>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="temp.desc" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入描述信息" />
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
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 600px;height: 312px">
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
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 600px;height: 312px">
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
import { fetchDataSourceTypes, fetchList, createDataSource, updateDataSource } from '@/api/datasource'

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
        status: 0,
        desc: '',
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
    fetchDataSourceTypes().then(response => {
      if (response.data !== null) {
        this.dataSourceTypeOptions = response.data.dataSourceTypeOptions
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

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.2 * 1000)
      })
    },
    handleAdd() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleFilter() {
      this.getList()
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
    handleModifyStatus() {
      console.log('handleModifyStatus')
    },
    handleDelete() {
      console.log('handleDelete')
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.author = this.$store.getters.name
          this.temp.timestamp = new Date()
          createDataSource(this.temp).then(() => {
            console.log('list.unshift: ' + JSON.stringify(this.list))
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.author = this.$store.getters.name
          this.temp.timestamp = new Date()
          updateDataSource(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
