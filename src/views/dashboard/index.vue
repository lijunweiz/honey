<template>
  <div class="dashboard-container">
    <!--    <div class="dashboard-text">name: {{ name }}</div>-->
    <!--    <div class="dashboard-text">roles: <span v-for="role in roles" :key="role">{{ role }}</span></div>-->
    <h2 class="dashboard-text" style="color: red">金融风控决策引擎-智能风控</h2>
    <div v-show="false">beaver</div>
    <div class="dashboard-text">
      <div>
        <p>目标</p>
        <ul>
          <li>数据源配置</li>
          <li>变量配置</li>
          <li>表达式</li>
          <li>评分卡</li>
          <li>流程编排</li>
          <li>权限控制</li>
        </ul>
      </div>
      <div>
        <p>特点</p>
        <ul>
          <li>灵活性：及时响应业务变化，生产实时变更，无需系统重启</li>
          <li>易用性：业务人员只需稍加学习即可入门本系统的使用，学习成本低</li>
          <li>易维护性：技术人员掌握基本技术，无需过多研究即可入门</li>
          <li>扩展性：系统支持高度扩展，仅需修改较少代码即可实现功能的插拔</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
