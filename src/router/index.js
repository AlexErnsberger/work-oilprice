import Vue from 'vue'
import Router from 'vue-router'
import OilPage from '@/views/OilPage'

Vue.use(Router)

export default new Router({
  mode:'history',
  routes: [
    {
      path: '/',
      name: 'OilPage',
      component: OilPage
    },
    {
      path: '*',
      redirect:'/'
    }
  ]
})
