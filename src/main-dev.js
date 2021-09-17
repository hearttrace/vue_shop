import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'

import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// 请求拦截，添加权限令牌
axios.interceptors.request.use(config => {
  config.headers.Authorization = sessionStorage.getItem('token')
  Nprogress.start()
  return config
})
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios

Vue.prototype.$clearObj = function (obj) {
  Object.keys(obj).map(key => { obj[key] = '' })
}

Vue.config.productionTip = false

Vue.filter('dateFormat', time => {
  const date = new Date(time)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
