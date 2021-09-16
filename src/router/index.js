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
      { path: '/roles', component: () => import(/* webpackChunkName: "about" */ '../components/right/Roles.vue') },
      { path: '/categories', component: () => import(/* webpackChunkName: "about" */ '../components/goods/Cate.vue') },
      { path: '/params', component: () => import(/* webpackChunkName: "about" */ '../components/goods/Params.vue') },
      { path: '/goods', component: () => import(/* webpackChunkName: "about" */ '../components/goods/List.vue') },
      { path: '/goods/add', component: () => import(/* webpackChunkName: "about" */ '../components/goods/Add.vue') },
      { path: '/goods/edit', component: () => import(/* webpackChunkName: "about" */ '../components/goods/Edit.vue') },
      { path: '/orders', component: () => import(/* webpackChunkName: "about" */ '../components/order/Orders.vue') }
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
