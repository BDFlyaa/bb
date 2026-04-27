<template>
  <div class="profile-container fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <h2 class="page-title gradient-text">个人中心</h2>
      <p class="page-subtitle">管理您的个人资料与安全设置</p>
    </div>

    <!-- User Info Banner -->
    <div class="user-banner glass-panel">
      <div class="banner-avatar" @click="triggerFileInput" title="点击更换头像">
        <img v-if="form.avatar" :src="form.avatar" alt="Avatar" class="avatar-img" @error="handleImageError" />
        <div v-else class="avatar-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div class="avatar-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span>更换头像</span>
        </div>
      </div>
      <div class="banner-info">
        <div class="banner-header">
          <h3 class="banner-name">{{ form.name || '未设置昵称' }}</h3>
          <span class="role-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            {{ form.role === 'admin' ? '管理员' : '志愿者' }}
          </span>
        </div>
        <p class="banner-bio">{{ form.bio || '这个人很懒，还没有写简介...' }}</p>
        <div class="banner-stats">
          <div class="stat-item">
            <span class="stat-value">{{ form.points }}</span>
            <span class="stat-label">环保积分</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">LV.2</span>
            <span class="stat-label">当前等级</span>
          </div>
        </div>
      </div>
      <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleFileChange" />
    </div>

    <!-- Tabs Navigation -->
    <div class="profile-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'profile' }" 
        @click="activeTab = 'profile'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        基本资料
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'security' }" 
        @click="activeTab = 'security'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        安全设置
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'preferences' }" 
        @click="activeTab = 'preferences'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        偏好设置
      </button>
    </div>

    <div class="profile-content">
      <!-- Tab: Basic Profile -->
      <div v-if="activeTab === 'profile'" class="profile-card glass-panel fade-in">
        <h3 class="card-title">
          <span class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <span>基本资料</span>
        </h3>

        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label>用户名 (不可修改)</label>
              <input type="text" :value="form.username" disabled class="disabled-input">
            </div>
            <div class="form-group">
              <label>昵称</label>
              <input type="text" v-model="form.name" required placeholder="请输入昵称">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>性别</label>
              <select v-model="form.gender">
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="secret">保密</option>
              </select>
            </div>
            <div class="form-group">
              <label>所在地</label>
              <input type="text" v-model="form.location" placeholder="例如：上海市">
            </div>
          </div>

          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="form.bio" rows="4" placeholder="介绍一下你自己..."></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isSaving">
              <svg v-if="!isSaving" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span class="btn-spinner" v-if="isSaving"></span>
              {{ isSaving ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tab: Security Settings -->
      <div v-if="activeTab === 'security'" class="profile-card glass-panel fade-in">
        <h3 class="card-title card-title-security">
          <span class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <span>安全设置</span>
        </h3>

        <!-- Password Change Section -->
        <div class="security-section">
          <h4 class="section-title">修改密码</h4>
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label>当前密码</label>
              <input type="password" v-model="passwordForm.currentPassword" required placeholder="请输入当前密码">
            </div>
            <div class="form-group">
              <label>新密码</label>
              <input type="password" v-model="passwordForm.newPassword" required placeholder="请输入新密码 (至少6位)">
              <!-- Password strength indicator -->
              <div class="password-strength" v-if="passwordForm.newPassword">
                <div class="strength-bar">
                  <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthPercent + '%' }"></div>
                </div>
                <span class="strength-label" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input type="password" v-model="passwordForm.confirmNewPassword" required placeholder="请再次输入新密码">
              <span class="password-match-hint" v-if="passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                两次密码不一致
              </span>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-danger-solid" :disabled="isChangingPassword">
                <svg v-if="!isChangingPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span class="btn-spinner" v-if="isChangingPassword"></span>
                {{ isChangingPassword ? '修改中...' : '修改密码' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tab: Preferences -->
      <div v-if="activeTab === 'preferences'" class="profile-card glass-panel fade-in">
        <h3 class="card-title">
          <span class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </span>
          <span>偏好设置</span>
        </h3>
        
        <div class="preferences-list">
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">系统通知</span>
              <span class="pref-desc">接收关于回收审核结果和系统动态的通知</span>
            </div>
            <label class="switch">
              <input type="checkbox" checked>
              <span class="slider round"></span>
            </label>
          </div>
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">隐私模式</span>
              <span class="pref-desc">在排行榜中隐藏我的个人资料</span>
            </div>
            <label class="switch">
              <input type="checkbox">
              <span class="slider round"></span>
            </label>
          </div>
          <div class="pref-item">
            <div class="pref-info">
              <span class="pref-label">语言设置</span>
              <span class="pref-desc">选择界面显示的语言</span>
            </div>
            <select class="pref-select">
              <option value="zh">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { 
  form, passwordForm, isSaving, isChangingPassword, activeTab,
  saveProfile, changePassword, handleImageError, initProfile, 
  fileInput, triggerFileInput, handleFileChange
} from './ProfileEdit';

// Password strength computation
const passwordStrengthPercent = computed(() => {
  const len = passwordForm.newPassword.length;
  if (len === 0) return 0;
  if (len < 6) return 25;
  if (len < 8) return 50;
  if (len < 12) return 75;
  return 100;
});

const passwordStrengthClass = computed(() => {
  const p = passwordStrengthPercent.value;
  if (p <= 25) return 'strength-weak';
  if (p <= 50) return 'strength-fair';
  if (p <= 75) return 'strength-good';
  return 'strength-strong';
});

const passwordStrengthText = computed(() => {
  const p = passwordStrengthPercent.value;
  if (p <= 25) return '弱';
  if (p <= 50) return '一般';
  if (p <= 75) return '良好';
  return '强';
});

onMounted(() => {
  void initProfile();
});
</script>

<style scoped src="./ProfileEdit.css"></style>
