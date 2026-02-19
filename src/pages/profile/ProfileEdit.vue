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
        <h3 class="banner-name">{{ form.name || '未设置昵称' }}</h3>
        <span class="role-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          志愿者
        </span>
        <p class="banner-bio">{{ form.bio || '这个人很懒，还没有写简介...' }}</p>
      </div>
      <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleFileChange" />
    </div>

    <div class="profile-grid">
      <!-- 左侧：基本资料 -->
      <div class="profile-card glass-panel card-stagger-1">
        <h3 class="card-title">
          <span class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <span>基本资料</span>
        </h3>

        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label>昵称</label>
            <input type="text" v-model="form.name" required placeholder="请输入昵称">
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

      <!-- 右侧：安全设置 -->
      <div class="profile-card glass-panel card-stagger-2">
        <h3 class="card-title card-title-security">
          <span class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <span>安全设置</span>
        </h3>
        <form @submit.prevent="changePassword">
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
            <span class="password-match-hint match-ok" v-if="passwordForm.confirmNewPassword && passwordForm.newPassword === passwordForm.confirmNewPassword">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              密码一致
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { 
  form, passwordForm, isSaving, isChangingPassword, 
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
  initProfile();
});
</script>

<style scoped src="./ProfileEdit.css"></style>
