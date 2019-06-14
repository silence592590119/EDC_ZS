// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//引入bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap'
Vue.use(ElementUI);
Vue.config.productionTip = false
//全局配置axios
import Axios from 'axios'
Vue.prototype.$axios = Axios
//二次封装axios，添加请求拦截器和响应拦截器 
import axiosApi from '@/request/http';
Vue.use(axiosApi)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
}).$mount('#app')
