<template>
  <el-tabs v-model="activeName" type="border-card" :visible.sync="dialogFormVisible">
    <el-tab-pane label="基本信息" name="basicInfo">
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 600px; margin-left:50px;">
          <el-form-item label="变量英文">
            <el-input v-model="temp.variableNameEn" :disabled="dialogStatus==='update'" />
          </el-form-item>
          <el-form-item label="变量中文">
            <el-input v-model="temp.variableNameZh" />
          </el-form-item>
          <el-form-item label="变量类型">
            <el-input v-model="temp.variableStatus" />
          </el-form-item>
          <el-form-item label="变量来源">
            <el-select v-model="temp.variableSource" class="filter-item" placeholder="请选择">
              <el-option v-for="(item,index) in variableSourceOptions" :key="index" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="需求名称">
            <el-input v-model="temp.requirementName" />
          </el-form-item>
          <el-form-item label="获取地址">
            <el-input v-model="temp.variableAddress" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="temp.variableDesc" :autosize="{ minRows: 2, maxRows: 8}" type="textarea" placeholder="请输入描述信息" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
        </div>
      </el-dialog>
    </el-tab-pane>
    <el-tab-pane label="前置处理" name="preProcess">
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 600px; margin-left:50px;">
          <el-form-item label="变量英文">
            <el-input v-model="temp.variableNameEn" :disabled="dialogStatus==='update'" />
          </el-form-item>
          <el-form-item label="变量中文">
            <el-input v-model="temp.variableNameZh" />
          </el-form-item>
          <el-form-item label="变量类型">
            <el-input v-model="temp.variableStatus" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
        </div>
      </el-dialog>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  name: 'TabPane',
  props: {

  }
}
</script>

<style lang="scss" scoped>

</style>
