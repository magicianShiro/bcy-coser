import Vue from 'vue'
import Router from 'vue-router'

function _import (pathName) {
  return () => import(/* webpackChunkName: "[request]" */`../views/${pathName}`)
}

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/album',
      name: 'album',
      component: _import('album.vue')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
