<template>
  <div class="checkin-view">
    <h2>📷 智能打卡</h2>
    <div class="upload-zone glass-panel">
      <div v-if="!aiResult" @click="triggerAiCheck" style="cursor: pointer; padding: 50px;">
        <span style="font-size: 4rem;">📸</span>
        <p>点击上传 (模拟 AI 识别)</p>
      </div>
      <div v-else class="ai-result">
        <h3>识别成功！</h3>
        <p>物品: PET 塑料瓶</p>
        <p>预估积分: +30</p>
        <button class="btn-primary" @click="aiResult = false">确认打卡</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const aiResult = ref(false);

const triggerAiCheck = () => {
  setTimeout(() => { aiResult.value = true; }, 1000);
};
</script>

<style scoped>
.upload-zone { text-align: center; padding: 40px; }
</style>