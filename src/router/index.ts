import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/Home.vue')
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../pages/auth/Login.vue')
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../pages/auth/Register.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../pages/map/MapView.vue')
    },
    {
      path: '/checkin',
      name: 'checkin',
      component: () => import('../pages/checkin/Checkin.vue')
    },
    {
      path: '/blockchain',
      name: 'blockchain',
      component: () => import('../pages/blockchain/Traceability.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../pages/stats/Statistics.vue')
    },
    {
      path: '/mall',
      name: 'mall',
      component: () => import('../pages/mall/Mall.vue')
    },
    {
      path: '/science',
      name: 'science',
      component: () => import('../pages/science/Science.vue')
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('../pages/community/Community.vue')
    }
  ]
})

export default router
