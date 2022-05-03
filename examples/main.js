import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import pieceUI from '../src/index'
import 'font-awesome/css/font-awesome.css'
import '@/assets/font/iconfont.css'

Vue.config.productionTip = false

Vue.use(pieceUI, {
  capture: true
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
