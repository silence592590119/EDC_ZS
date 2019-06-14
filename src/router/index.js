import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/components/Login/Login'
import Program from '@/components/Program/Program'
import Patient from '@/components/Patient/Patient'
import Follow from '@/components/Follow/Follow'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/program',
      name: 'program',
      component: Program
    },
    {
      path:'/patient',
      name:'patient',
      component:Patient
    },
    {
      path:'/follow',
      name:'follow',
      component:Follow
    }
  ]
})
