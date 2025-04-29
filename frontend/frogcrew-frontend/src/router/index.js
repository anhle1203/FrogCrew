// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import UserDashboard from '../views/UserDashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import RegisterDashboard from '../views/RegisterDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresGuest: true }
  },
  {
    path: '/user',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/register',
    name: 'RegisterDashboard',
    component: RegisterDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userRole = localStorage.getItem('userRole')

  // Redirect to login if route requires auth and user isn't authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
    return
  }

  // Redirect away from login if already authenticated
  if (to.meta.requiresGuest && isAuthenticated) {
    next(userRole === 'admin' ? '/admin' : '/user')
    return
  }

  // Check role permissions
  if (to.meta.requiresAuth && to.meta.role !== userRole) {
    next('/') // or show an unauthorized page
    return
  }

  next()
})

export default router