<template>
  <div class="dashboard-container">
    <!--    <div class="dashboard-text">name: {{ name }}</div>-->
    <!--    <div class="dashboard-text">roles: <span v-for="role in roles" :key="role">{{ role }}</span></div>-->
    <h2 class="dashboard-text" style="color: red;">风控决策引擎</h2>
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
