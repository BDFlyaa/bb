<template>
  <div class="traceability-view">
    <h2>🔗 区块链溯源记录</h2>
    
    <div class="search-section glass-panel">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="输入哈希值或批次号查询溯源信息..."
          @keyup.enter="handleSearch"
        >
        <button class="btn-primary" @click="handleSearch">🔍 查询</button>
      </div>
    </div>

    <div class="blockchain-list glass-panel">
      <div v-if="filteredData.length === 0" class="no-data">
        没有找到相关记录
      </div>
      
      <div class="chain-item" v-for="(block, i) in filteredData" :key="i">
        <div class="item-header">
          <span class="batch-id">📦 {{ block.batch }}</span>
          <span class="status-verified">✅ 已上链 Verified</span>
        </div>
        
        <div class="hash-row">
          <span class="label">Hash:</span>
          <span class="hash-value">{{ block.hash }}</span>
        </div>
        
        <div class="meta-info">
          <span>⏱️ 时间戳: {{ block.time }}</span>
          <span>⚖️ 重量: {{ block.weight }}</span>
          <span>📍 来源: {{ block.source }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 模拟数据接口
interface BlockData {
  hash: string;
  batch: string;
  time: string;
  weight: string;
  source: string;
}

const searchQuery = ref('');

// 模拟区块链数据
const blockchainData = ref<BlockData[]>([
  { 
    hash: '0x7f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', 
    batch: 'B-20231024-01', 
    time: '2023-10-24 10:42:15',
    weight: '50.5 kg',
    source: '站点 A - 阳光海滩'
  },
  { 
    hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', 
    batch: 'B-20231024-02', 
    time: '2023-10-24 11:15:30',
    weight: '120.0 kg',
    source: '站点 C - 河口拦截网'
  },
  { 
    hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 
    batch: 'B-20231025-01', 
    time: '2023-10-25 09:20:00',
    weight: '35.2 kg',
    source: '站点 B - 社区回收站'
  },
]);

// 简单的过滤逻辑
const filteredData = computed(() => {
  if (!searchQuery.value) return blockchainData.value;
  const q = searchQuery.value.toLowerCase();
  return blockchainData.value.filter(item => 
    item.hash.toLowerCase().includes(q) || 
    item.batch.toLowerCase().includes(q)
  );
});

const handleSearch = () => {
  // 实际项目中这里会调用 API
  console.log('Searching for:', searchQuery.value);
};
</script>

<style scoped>
.search-section {
  padding: 20px;
  margin-bottom: 20px;
}
.search-box {
  display: flex;
  gap: 10px;
}
.search-box input {
  flex: 1;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  outline: none;
}
.search-box input:focus {
  border-color: #00b4db;
}

.blockchain-list {
  padding: 20px;
}

.chain-item {
  padding: 15px;
  border-left: 3px solid #00b4db;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 15px;
  border-radius: 0 8px 8px 0;
  transition: background 0.3s;
}
.chain-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.batch-id { font-weight: bold; font-size: 1.1rem; color: #fff; }
.status-verified { color: #4ade80; font-size: 0.9rem; background: rgba(74, 222, 128, 0.1); padding: 2px 8px; border-radius: 4px; }

.hash-row {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  word-break: break-all;
  font-size: 0.85rem;
}
.hash-row .label { color: #888; margin-right: 10px; }
.hash-row .hash-value { color: #00b4db; }

.meta-info {
  display: flex;
  gap: 20px;
  font-size: 0.85rem;
  color: #aaa;
  flex-wrap: wrap;
}

.no-data {
  text-align: center;
  color: #888;
  padding: 20px;
}
</style>