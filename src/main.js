// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import service from '@/assets/js/service.js'
import '@/assets/js/xy.js'
import '@/assets/js/flexible.js'
import '@/assets/css/style.css'

Vue.use(service)
//注册axios
Vue.prototype.$http = axios
Vue.config.productionTip = false


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
