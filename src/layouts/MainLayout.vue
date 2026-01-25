<template>
  <div class="main-layout fade-in">
    <aside class="sidebar glass-panel">
      <div class="brand">
        <img src="../assets/images/logo.png" alt="PureOcean Logo" class="logo-img" />
        <span>PureOcean</span>
      </div>
      <div class="user-info">
        <div class="avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div>
          <div class="username">{{ store.user.name }}</div>
          <div class="role-badge">{{ store.userDisplayRole }}</div>
        </div>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/app/stats" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          数据大屏
        </router-link>
        <router-link to="/app/map" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          回收地图
        </router-link>
        <router-link to="/app/checkin" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          智能打卡
        </router-link>
        <router-link to="/app/blockchain" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          溯源查询
        </router-link>
        <router-link to="/app/mall" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          积分商城
        </router-link>
        <router-link to="/app/community" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          志愿者社区
        </router-link>
      </nav>
      
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </aside>

    <main class="content-area">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { store } from '../stores';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  store.logout();
  router.push('/');
};
</script>

<style scoped>
.main-layout { display: flex; height: 100vh; position: relative; z-index: 10; }
.sidebar { width: 250px; margin: 20px; padding: 20px; display: flex; flex-direction: column; }
.brand { 
  font-size: 1.5rem; 
  font-weight: bold; 
  margin-bottom: 2rem; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}
.logo-img {
  height: 70px;
  width: auto;
  object-fit: contain;
}
.user-info { display: flex; gap: 10px; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.nav-menu { flex: 1; }
.nav-item { display: block; text-decoration: none; color: rgba(255,255,255,0.7); padding: 12px; margin-bottom: 5px; border-radius: 8px; transition: 0.3s; }
.nav-item:hover, .nav-item.router-link-active { background: rgba(255,255,255,0.15); color: white; }
.logout-btn { background: none; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px; border-radius: 6px; cursor: pointer; }
.content-area { flex: 1; padding: 20px 20px 20px 0; overflow-y: auto; }
</style>