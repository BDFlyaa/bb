<template>
  <div class="main-layout fade-in">
    <!-- 移动端顶部状态栏 -->
    <header class="mobile-header glass-panel">
      <button class="menu-toggle" @click="toggleMenu">
        <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="mobile-brand">
        <img src="../assets/images/logo.png" alt="PureOcean Logo" class="logo-img-small" />
        <span>PureOcean</span>
      </div>
      <div class="mobile-actions">
        <NotificationBell />
        <div class="mobile-user" @click="router.push('/app/profile')">
          <img v-if="store.user.avatar" :src="store.user.avatar" alt="User Avatar" class="user-avatar-img-small" />
          <div v-else class="avatar-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>
      </div>
    </header>

    <!-- 侧边栏（移动端作为抽屉菜单） -->
    <aside :class="['sidebar', 'glass-panel', { 'mobile-open': isMenuOpen }]">
      <div class="brand desktop-only">
        <img src="../assets/images/logo.png" alt="PureOcean Logo" class="logo-img" />
        <span>PureOcean</span>
      </div>
      <div class="user-info-row">
        <div class="user-info" @click="goToProfile" title="点击编辑个人资料">
          <div class="avatar">
            <img v-if="store.user.avatar" :src="store.user.avatar" alt="User Avatar" class="user-avatar-img" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="username">{{ store.user.name }}</div>
            <div class="role-badge">{{ store.userDisplayRole }}</div>
          </div>
        </div>
        <NotificationBell />
      </div>
      
      <nav class="nav-menu">
        <router-link to="/app/stats" class="nav-item" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          数据大屏
        </router-link>
        <router-link to="/app/map" class="nav-item" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          回收地图
        </router-link>
        <router-link to="/app/checkin" class="nav-item" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          {{ store.isAdmin ? '回收审核' : '智能打卡' }}
        </router-link>
        <router-link to="/app/blockchain" class="nav-item" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          溯源查询
        </router-link>
        <router-link to="/app/mall" class="nav-item" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          积分商城
        </router-link>
        <router-link to="/app/community" class="nav-item" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          志愿者社区
        </router-link>
        <router-link to="/app/profile" class="nav-item" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          设置
        </router-link>
      </nav>
      
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </aside>

    <!-- 移动端遮罩层 -->
    <div v-if="isMenuOpen" class="mobile-overlay" @click="closeMenu"></div>

    <main class="content-area">
      <router-view></router-view>
    </main>

    <!-- AI 聊天助手 -->
    <AIChat />

    <!-- 通知面板 -->
    <NotificationPanel />

    <!-- 全局 Toast -->
    <GlobalToast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { store } from '../stores';
import { useRouter } from 'vue-router';
import AIChat from '../pages/ai/AIChat.vue';
import NotificationBell from '../components/notification/NotificationBell.vue';
import NotificationPanel from '../components/notification/NotificationPanel.vue';
import GlobalToast from '../components/common/GlobalToast.vue';
import { useNotificationPolling } from '../composables/useNotificationPolling';

const router = useRouter();
const isMenuOpen = ref(false);

// 启动通知轮询
useNotificationPolling();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const goToProfile = () => {
  router.push('/app/profile');
  closeMenu();
};

const handleLogout = () => {
  store.logout();
  router.push('/');
};
</script>

<style scoped>
.main-layout { display: flex; height: 100vh; position: relative; z-index: 10; }

/* 顶部移动端状态栏默认隐藏 */
.mobile-header { display: none; }

.sidebar { width: 250px; margin: 20px; padding: 20px; display: flex; flex-direction: column; transition: transform 0.3s ease; }
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
.user-info-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.user-info { display: flex; gap: 10px; align-items: center; flex: 1; cursor: pointer; transition: background-color 0.3s; padding: 10px; border-radius: 8px; }
.user-info:hover { background-color: rgba(255, 255, 255, 0.1); }
.user-avatar-img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.nav-menu { flex: 1; }
.nav-item { display: block; text-decoration: none; color: rgba(255,255,255,0.7); padding: 12px; margin-bottom: 5px; border-radius: 8px; transition: 0.3s; }
.nav-item:hover, .nav-item.router-link-active { background: rgba(255,255,255,0.15); color: white; }
.logout-btn { background: none; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px; border-radius: 6px; cursor: pointer; }
.content-area { flex: 1; padding: 20px 20px 20px 0; overflow-y: auto; }

/* 响应式样式 */
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    height: 60px;
    margin: 10px;
    z-index: 1001;
    box-sizing: border-box;
  }
  
  .menu-toggle {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .logo-img-small { height: 30px; }
  
  .mobile-user { cursor: pointer; }
  .mobile-actions { display: flex; align-items: center; gap: 8px; }
.user-avatar-img-small { width: 30px; height: 30px; border-radius: 50%; }
  .avatar-placeholder { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 260px;
    margin: 0;
    z-index: 2000;
    transform: translateX(-100%);
    border-radius: 0 16px 16px 0;
    background: rgba(2, 26, 46, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: 10px 0 30px rgba(0,0,0,0.5);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .desktop-only { display: none; }
  
  .content-area {
    padding: 10px;
    height: calc(100vh - 80px);
  }
  
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(3px);
    z-index: 1999;
  }
}
</style>