<template>
  <div class="auth-container fade-in">
    <router-link to="/" class="back-home-btn" title="返回首页">返回首页</router-link>
    <div class="auth-card glass-panel">
      <div class="auth-header">
        <img src="../../assets/images/logo.png" alt="PureOcean Logo" class="auth-logo" />
        <h1>PureOcean ID</h1>
      </div>
      <div class="tabs">
        <span class="active">登录</span>
      </div>
      <form @submit.prevent="submitLogin">
        <div class="input-group">
          <input type="text" placeholder="用户名 (admin/user)" v-model="form.username" required>
        </div>
        <div class="input-group">
          <input type="password" placeholder="密码" v-model="form.password">
        </div>
        <button type="submit" class="btn-primary full-width">进入系统</button>
        <div class="auth-footer">
          <p>没有账号？ <router-link to="/register">立即注册</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { store } from '../../stores';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = reactive({ username: '', password: '', role: 'volunteer' });

const submitLogin = async () => {
  const result = await store.login(form.username, form.password);
  if (result.success) {
    router.push('/app/stats');
  } else {
    alert(result.message);
  }
};
</script>

<style scoped>
.auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; z-index: 10; position: relative; }
.auth-card { width: 350px; padding: 2rem; text-align: center; }
.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}
.auth-logo {
  height: 80px;
  width: auto;
  object-fit: contain;
}
.auth-header h1 {
  margin: 0;
  font-size: 1.8rem;
}
.tabs { margin-bottom: 1.5rem; }
.tabs .active { color: var(--accent); border-bottom: 2px solid var(--accent); padding-bottom: 5px; font-weight: bold; }
.input-group input, .input-group select { width: 100%; margin-bottom: 1rem; padding: 10px; background: rgba(0,0,0,0.2); border: none; color: white; border-radius: 6px; box-sizing: border-box; }
.input-group select option { background: #001f3f; color: white; }
.full-width { width: 100%; }
.auth-footer { margin-top: 1.5rem; font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }
.auth-footer a { color: var(--accent); text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }

.back-home-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  padding: 8px 20px;
  background: linear-gradient(90deg, #00b4db, #0083b0);
  color: white;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  z-index: 100;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 180, 219, 0.3);
}

.back-home-btn:hover {
  background: linear-gradient(90deg, #00d4ff, #00b4db);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 180, 219, 0.4);
}
</style>