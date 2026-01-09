<template>
  <div class="traceability-view">
    <!-- 志愿者视图 -->
    <div v-if="!isAdmin">
      <div class="header-section">
        <h2>🔍 溯源查询</h2>
        <p>输入您的回收批次号，见证塑料瓶的“新生”之旅</p>
      </div>

      <div class="search-container">
        <div class="search-box glass-panel">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="输入批次号，例如: B-20231024-01" 
            @keyup.enter="handleSearch"
          />
          <button class="btn-primary" @click="handleSearch">立即查询</button>
        </div>
      </div>

      <Transition name="slide-up">
        <div v-if="showResult" class="result-container">
          <div class="trace-timeline glass-panel">
            <div class="timeline-item completed">
              <div class="dot"></div>
              <div class="time">2023-10-24 10:42</div>
              <div class="content">
                <h4>投放回收</h4>
                <p>在 [阳光海滩回收站] 完成投放</p>
              </div>
            </div>
            <div class="timeline-item completed">
              <div class="dot"></div>
              <div class="time">2023-10-24 18:00</div>
              <div class="content">
                <h4>物流转运</h4>
                <p>由 [极速环保物流] 运往再生处理中心</p>
              </div>
            </div>
            <div class="timeline-item completed">
              <div class="dot"></div>
              <div class="time">2023-10-25 09:30</div>
              <div class="content">
                <h4>分拣破碎</h4>
                <p>已完成自动化分拣与破碎，进入清洗阶段</p>
              </div>
            </div>
            <div class="timeline-item active">
              <div class="dot"></div>
              <div class="time">2023-10-26 10:00</div>
              <div class="content">
                <h4>再生加工</h4>
                <p>正在拉丝造粒，即将制成环保再生纤维</p>
              </div>
            </div>
          </div>

          <div class="achievement-card glass-panel">
            <div class="achievement-icon">👚</div>
            <h3>环保成就</h3>
            <p>您的这次回收贡献将转化为</p>
            <div class="product-name">1.2 件再生 T 恤的原料</div>
            <div class="stats-mini">
              <span>减少碳排放 0.65kg</span>
              <span>节省石油 0.3L</span>
            </div>
            <div class="hash-footer">
              <span class="label">区块链哈希存证:</span>
              <span class="hash-value">0x7f9a...8f9a</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 管理员视图 -->
    <div v-else>
      <div class="header-section">
        <h2>🛡️ 溯源链管理</h2>
        <div class="admin-toolbar">
          <button class="btn-primary" @click="showLogisticsModal = true">📦 录入物流信息</button>
          <button class="btn-info" @click="showFactoryModal = true">🏭 录入加工数据</button>
        </div>
      </div>

      <div class="trace-list glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>批次号</th>
              <th>当前状态</th>
              <th>最新位置</th>
              <th>操作员</th>
              <th>区块链状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in blockchainData" :key="t.batch">
              <td>{{ t.batch }}</td>
              <td><span class="status-tag verified">已处理</span></td>
              <td>{{ t.source }}</td>
              <td>管理员</td>
              <td><span class="hash-tag">已上链</span></td>
              <td>
                <button class="btn-sm btn-ghost" @click="editTrace(t)">更新状态</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 物流录入模态框 (简化版) -->
      <div v-if="showLogisticsModal" class="modal-overlay">
        <div class="modal-content glass-panel">
          <h3>录入物流信息</h3>
          <div class="form-grid">
            <div class="input-group">
              <label>批次号</label>
              <input type="text" v-model="newLogistics.batch" placeholder="输入批次号" />
            </div>
            <div class="input-group">
              <label>运输单位</label>
              <input type="text" v-model="newLogistics.carrier" placeholder="例如: 顺丰环保" />
            </div>
            <div class="input-group">
              <label>目的地</label>
              <input type="text" v-model="newLogistics.dest" placeholder="处理厂名称" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="showLogisticsModal = false">取消</button>
            <button class="btn-primary" @click="saveLogistics">保存并上链</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { store } from '../../stores';

const isAdmin = computed(() => store.isAdmin);

const searchQuery = ref('');
const showResult = ref(false);
const showLogisticsModal = ref(false);
const showFactoryModal = ref(false);

const newLogistics = ref({
  batch: '',
  carrier: '',
  dest: ''
});

// 模拟区块链数据
const blockchainData = ref([
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
  }
]);

const handleSearch = () => {
  if (!searchQuery.value) return;
  showResult.value = true;
};

const saveLogistics = () => {
  if (!newLogistics.value.batch) {
    alert('请输入批次号');
    return;
  }
  alert(`批次 ${newLogistics.value.batch} 的物流信息已存入区块链`);
  showLogisticsModal.value = false;
};

const editTrace = (t: any) => {
  alert(`准备更新批次 ${t.batch} 的生产进度`);
};
</script>

<style scoped>
.traceability-view {
  padding: 10px;
}

.header-section {
  margin-bottom: 30px;
}

.header-section h2 {
  margin-bottom: 10px;
  background: linear-gradient(to right, #fff, #00b4db);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-section p {
  color: #aaa;
}

/* 搜索框 */
.search-container {
  margin-bottom: 40px;
}

.search-box {
  display: flex;
  gap: 15px;
  padding: 15px;
  max-width: 600px;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 1.1rem;
  outline: none;
}

/* 结果展示 */
.result-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.trace-timeline {
  padding: 40px;
}

.timeline-item {
  position: relative;
  padding-left: 40px;
  padding-bottom: 40px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.timeline-item:last-child {
  border-left-color: transparent;
}

.timeline-item .dot {
  position: absolute;
  left: -9px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #333;
  border: 3px solid #1a1a1a;
}

.timeline-item.completed .dot {
  background: #52c41a;
  box-shadow: 0 0 10px #52c41a;
}

.timeline-item.active .dot {
  background: #00e5ff;
  box-shadow: 0 0 10px #00e5ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.timeline-item .time {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.timeline-item h4 {
  margin-bottom: 5px;
}

.timeline-item p {
  color: #aaa;
  font-size: 0.95rem;
}

/* 成就卡片 */
.achievement-card {
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.achievement-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.product-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00e5ff;
  margin: 15px 0;
}

.stats-mini {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  color: #888;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
}

.hash-footer {
  margin-top: 20px;
  font-size: 0.75rem;
  color: #555;
  text-align: left;
}

.hash-footer .hash-value {
  font-family: monospace;
  color: #00e5ff;
  margin-left: 5px;
}

/* 管理员界面 */
.admin-toolbar {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.trace-list {
  margin-top: 20px;
  padding: 20px;
}

.hash-tag {
  background: rgba(0, 229, 255, 0.1);
  color: #00e5ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid rgba(0, 229, 255, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 30px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 25px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

/* 动画 */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.5s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
</style>