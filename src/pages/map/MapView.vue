<template>
  <div class="map-view">
    <div class="header">
      <h2>回收点分布图</h2>
      <button class="btn-primary" @click="showReportModal = true">＋ 申报新点位</button>
    </div>
    <div class="map-container glass-panel">
      <div class="map-placeholder">
        <p>📍 高德地图 API 集成区域</p>
        <div class="mock-pin" style="top:30%; left:40%;" title="回收站A">♻️</div>
      </div>
    </div>
    <div v-if="showReportModal" class="modal-overlay">
      <div class="modal glass-panel">
        <h3>申报新回收点</h3>
        <input type="text" placeholder="地址">
        <div style="margin-top:10px; text-align:right">
          <button @click="showReportModal = false">取消</button>
          <button class="btn-primary" @click="showReportModal = false">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const showReportModal = ref(false);
</script>

<style scoped>
.header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.map-container { height: 500px; background: rgba(0,0,0,0.2); position: relative; }
.map-placeholder { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; opacity: 0.5; }
.mock-pin { position: absolute; font-size: 1.5rem; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal { padding: 30px; width: 400px; color: white; }
.modal input { width: 100%; padding: 10px; margin-bottom: 10px; background: rgba(0,0,0,0.3); border: 1px solid #555; color: white; }
</style>