<template>
  <div class="app-container">
    <div class="logic-flow-view">
      <h3 class="demo-title">LogicFlow Test</h3>
      <!-- 辅助工具栏 -->
      <Control
        v-if="lf"
        class="demo-control"
        :lf="lf"
        @catData="catData"
      />
      <!-- 节点面板 -->
      <NodePanel v-if="lf" :lf="lf" :node-list="nodeList" />
      <!-- 画布 -->
      <div id="LF-view" ref="container" />
      <!-- 用户节点自定义操作面板 -->
      <AddPanel
        v-if="showAddPanel"
        class="add-panel"
        :style="addPanelStyle"
        :lf="lf"
        :node-data="addClickNode"
        @addNodeFinish="hideAddPanel"
      />
      <!-- 属性面板 -->
      <el-drawer
        title="设置节点属性"
        :visible.sync="dialogVisible"
        direction="rtl"
        size="500px"
        :before-close="closeDialog"
      >
        <PropertyDialog
          v-if="dialogVisible"
          :node-data="clickNode"
          :lf="lf"
          @setPropertiesFinish="closeDialog"
        />
      </el-drawer>
      <!-- 数据查看面板 -->
      <el-dialog
        title="数据"
        :visible.sync="dataVisible"
        width="50%"
      >
        <DataDialog :graph-data="graphData" />
      </el-dialog>
    </div>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
// const LogicFlow = window.LogicFlow
import { Menu, Snapshot, MiniMap } from '@logicflow/extension'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'
import NodePanel from '../../components/LogicPanel/LFComponents/NodePanel'
import AddPanel from '../../components/LogicPanel/LFComponents/AddPanel'
import Control from '../../components/LogicPanel/LFComponents/Control'
import PropertyDialog from '../../components/LogicPanel/PropertySetting/PropertyDialog'
import DataDialog from '../../components/LogicPanel/LFComponents/DataDialog'
import { nodeList } from '@/components/LogicPanel/config'

import {
  registerStart,
  registerUser,
  registerEnd,
  registerPush,
  registerDownload,
  registerPolyline,
  registerTask,
  registerConnect
} from '../../components/LogicPanel/registerNode'
const demoData = require('../../components/LogicPanel/data.json')

export default {
  name: 'LF',
  components: { NodePanel, AddPanel, Control, PropertyDialog, DataDialog },
  data() {
    return {
      lf: null,
      showAddPanel: false,
      addPanelStyle: {
        top: 0,
        left: 0
      },
      nodeData: null,
      addClickNode: null,
      clickNode: null,
      dialogVisible: false,
      graphData: null,
      dataVisible: false,
      config: {
        background: {
          backgroundColor: '#f7f9ff'
        },
        grid: {
          size: 10,
          visible: false
        },
        keyboard: {
          enabled: true
        },
        edgeTextDraggable: true,
        hoverOutline: false
      },
      moveData: {},
      nodeList
    }
  },
  mounted() {
    this.initLf()
  },
  methods: {
    initLf() {
      // 画布配置
      const lf = new LogicFlow({
        ...this.config,
        plugins: [
          Menu,
          MiniMap,
          Snapshot
        ],
        container: this.$refs.container
      })
      this.lf = lf
      // 设置主题
      lf.setTheme({
        circle: {
          stroke: '#000000',
          strokeWidth: 1,
          outlineColor: '#88f'
        },
        rect: {
          outlineColor: '#88f',
          strokeWidth: 1
        },
        polygon: {
          strokeWidth: 1
        },
        polyline: {
          stroke: '#000000',
          hoverStroke: '#000000',
          selectedStroke: '#000000',
          outlineColor: '#88f',
          strokeWidth: 1
        },
        nodeText: {
          color: '#000000'
        },
        edgeText: {
          color: '#000000',
          background: {
            fill: '#f7f9ff'
          }
        }
      })
      this.registerNode()
    },
    // 自定义
    registerNode() {
      registerStart(this.lf)
      registerUser(this.lf)
      registerEnd(this.lf)
      registerPush(this.lf, this.clickPlus, this.mouseDownPlus)
      registerDownload(this.lf)
      registerPolyline(this.lf)
      registerTask(this.lf)
      registerConnect(this.lf)
      this.render()
    },
    render() {
      this.lf.render(demoData)
      this.lfEvent()
    },
    getData() {
      const data = this.lf.getGraphData()
      console.log(JSON.stringify(data))
    },
    lfEvent() {
      this.lf.on('node:click', ({ data }) => {
        console.log('node:click', data)
        this.$data.clickNode = data
        this.$data.dialogVisible = true
      })
      this.lf.on('edge:click', ({ data }) => {
        console.log('edge:click', data)
        this.$data.clickNode = data
        this.$data.dialogVisible = true
      })
      this.lf.on('element:click', () => {
        this.hideAddPanel()
      })
      this.lf.on('edge:add', ({ data }) => {
        console.log('edge:add', data)
      })
      this.lf.on('node:mousemove', ({ data }) => {
        console.log('node:mousemove')
        this.moveData = data
      })
      this.lf.on('blank:click', () => {
        this.hideAddPanel()
      })
      this.lf.on('connection:not-allowed', (data) => {
        this.$message({
          type: 'error',
          message: data.msg
        })
      })
      this.lf.on('node:mousemove', () => {
        console.log('on mousemove')
      })
    },
    clickPlus(e, attributes) {
      e.stopPropagation()
      console.log('clickPlus', e, attributes)
      const { clientX, clientY } = e
      console.log(clientX, clientY)
      this.$data.addPanelStyle.top = (clientY - 40) + 'px'
      this.$data.addPanelStyle.left = clientX + 'px'
      this.$data.showAddPanel = true
      this.$data.addClickNode = attributes
    },
    mouseDownPlus(e, attributes) {
      e.stopPropagation()
      console.log('mouseDownPlus', e, attributes)
    },
    hideAddPanel() {
      this.$data.showAddPanel = false
      this.$data.addPanelStyle.top = 0
      this.$data.addPanelStyle.left = 0
      this.$data.addClickNode = null
    },
    closeDialog() {
      this.$data.dialogVisible = false
    },
    catData() {
      this.$data.graphData = this.$data.lf.getGraphData()
      this.$data.dataVisible = true
    }
  }
}
</script>

<style>
  .logic-flow-view {
    height: 100vh;
    position: relative;
  }
  .demo-title{
    text-align: center;
    margin: 20px;
  }
  .demo-control{
    position: absolute;
    top: 50px;
    right: 50px;
    z-index: 2;
  }
  #LF-view{
    width: calc(100% - 100px);
    height: 80%;
    outline: none;
    margin-left: 50px;
  }
  .time-plus{
    cursor: pointer;
  }
  .add-panel {
    position: absolute;
    z-index: 11;
    background-color: white;
    padding: 10px 5px;
  }
  .el-drawer__body {
    height: 80%;
    overflow: auto;
    margin-top: -30px;
    z-index: 3;
  }

  @keyframes lf_animate_dash {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
