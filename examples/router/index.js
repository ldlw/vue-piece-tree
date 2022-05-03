import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/tree',
    name: 'tree',
    component: () => import('../views/tree.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
