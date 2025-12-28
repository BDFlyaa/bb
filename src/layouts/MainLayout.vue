<template>
  <div class="main-layout fade-in">
    <aside class="sidebar glass-panel">
      <div class="brand">
        <img src="../assets/images/logo.png" alt="PureOcean Logo" class="logo-img" />
        <span>PureOcean</span>
      </div>
      <div class="user-info">
        <div class="avatar">👤</div>
        <div>
          <div class="username">{{ store.user.name }}</div>
          <div class="role-badge">{{ store.user.role }}</div>
        </div>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/app/stats" class="nav-item">📊 数据大屏</router-link>
        <router-link to="/app/map" class="nav-item">🗺️ 回收地图</router-link>
        <router-link to="/app/checkin" class="nav-item">📷 智能打卡</router-link>
        <router-link to="/app/blockchain" class="nav-item">🔗 溯源查询</router-link>
        <router-link to="/app/mall" class="nav-item">🛍️ 积分商城</router-link>
        <router-link to="/app/community" class="nav-item">👥 志愿者社区</router-link>
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
  router.push('/login');
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