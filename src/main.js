import Vue from 'vue'
import ElementUI from 'element-ui'
import router from './router/index.js'
import App from './App.vue'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI, { zIndex: 300, size: 'small' })
Vue.config.productionTip = false
Vue.prototype.log = (...args) => console.info(...args)

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
