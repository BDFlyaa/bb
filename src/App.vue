<template>
  <WaveBackground />
  
  <div v-if="store.isLoading" class="shell-loader-overlay">
    <div class="shell-icon">🐚</div>
    <div class="loader-text">Loading Ocean Data...</div>
  </div>

  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { store } from './stores';
import WaveBackground from './components/ocean/WaveBackground.vue';

onMounted(() => {
  // 模拟应用初始化
  setTimeout(() => {
    store.stopLoading();
  }, 1000);
});
</script>

<style>
.shell-loader-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: #021B32; z-index: 999;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.shell-icon { font-size: 4rem; animation: pulse 2s infinite; }
.loader-text { margin-top: 1rem; color: #00b4db; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.5; }
}
</style>