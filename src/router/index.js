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
    component: () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
  },
  {
    path: '/home',
    redirect: '/welcome',
    component: () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue'),
    children: [
      { path: '/welcome', component: () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue') },
      { path: '/users', component: () => import(/* webpackChunkName: "user_role_rights" */ '../components/user/Users.vue') },
      { path: '/rights', component: () => import(/* webpackChunkName: "user_role_rights" */ '../components/right/Rights.vue') },
      { path: '/roles', component: () => import(/* webpackChunkName: "user_role_rights" */ '../components/right/Roles.vue') },
      { path: '/categories', component: () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate.vue') },
      { path: '/params', component: () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params.vue') },
      { path: '/goods', component: () => import(/* webpackChunkName: "goods" */ '../components/goods/List.vue') },
      { path: '/goods/add', component: () => import(/* webpackChunkName: "goods" */ '../components/goods/Add.vue') },
      { path: '/goods/edit', component: () => import(/* webpackChunkName: "goods" */ '../components/goods/Edit.vue') },
      { path: '/orders', component: () => import(/* webpackChunkName: "order_report" */ '../components/order/Orders.vue') },
      { path: '/reports', component: () => import(/* webpackChunkName: "order_report" */ '../components/report/Reports.vue') }
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
