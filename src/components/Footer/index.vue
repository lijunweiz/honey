<template>
  <div id="app-footer">
    <footer class="app-footer">
      <div class="footer-content">
        <span>Copyright&nbsp;&copy;&nbsp;{{ fullYear }}&nbsp;必易研发&nbsp;</span>
        <img src="@/assets/beian/beian.png" style="width: 16px;">
        <a href="https://beian.mps.gov.cn/#/query/webSearch?code=41100002000540" rel="noreferrer" target="_blank">豫公网安备41100002000540号</a>
        &nbsp;
        <a target="_blank" href="https://beian.miit.gov.cn/">豫ICP备2025108326</a>
        &nbsp;&#64;我也不知道&nbsp;&nbsp;
        <!-- eslint-disable -->
        <i class="el-icon-s-promotion"></i>&nbsp;
        <a target="_blank" href="mailto:takealeaf@yeah.net">takealeaf@yeah.net</a>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
    }
  },
  computed: {
    fullYear: {
      get() {
        return new Date().getFullYear()
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>
  .footer-content {
    position: fixed;
    right: 20px;
    text-align: right;
    bottom: 0;
    margin: 5px auto;
    width: 100%;
    color: #2c2c2c;
    font-size: 12px;
    line-height: 18px;
  }
</style>
