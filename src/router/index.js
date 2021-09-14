import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "about" */ '../components/Login.vue')
  },
  {
    path: '/home',
    redirect: '/welcome',
    component: () => import(/* webpackChunkName: "about" */ '../components/Home.vue'),
    children: [
      { path: '/welcome', component: () => import(/* webpackChunkName: "about" */ '../components/Welcome.vue') },
      { path: '/users', component: () => import(/* webpackChunkName: "about" */ '../components/user/Users.vue') },
      { path: '/rights', component: () => import(/* webpackChunkName: "about" */ '../components/right/Rights.vue') },
      { path: '/roles', component: () => import(/* webpackChunkName: "about" */ '../components/right/Roles.vue') }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
