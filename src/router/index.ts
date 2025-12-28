// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { store } from '../stores';

import Login from '../pages/auth/Login.vue';
import Register from '../pages/auth/Register.vue';
import MainLayout from '../layouts/MainLayout.vue';
import Home from '../pages/Home.vue';
import Statistics from '../pages/stats/Statistics.vue'; // 首页大屏

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/app',
      component: MainLayout,
      children: [
        { path: '', redirect: '/app/stats' },
        { path: 'stats', component: Statistics },
        { path: 'map', component: () => import('../pages/map/MapView.vue') },
        { path: 'checkin', component: () => import('../pages/checkin/Checkin.vue') },
        { path: 'blockchain', component: () => import('../pages/blockchain/Traceability.vue') },
        { path: 'mall', component: () => import('../pages/mall/Mall.vue') },
        { path: 'community', component: () => import('../pages/community/Community.vue') },
      ]
    }
  ]
});

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  
  if (authRequired && !store.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;