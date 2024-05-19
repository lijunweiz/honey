import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
// import filters from './filters/index'

import '@/icons' // icon
import '@/permission' // permission control

Vue.use(VueCompositionApi)
Vue.use(ElementUI)
// Object.keys(filters).forEach(key => {
//   Vue.filter(key, filters[key])
// })

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
