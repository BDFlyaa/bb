<template>
  <div class="checkin-view">
    <!-- 志愿者视图 -->
    <div v-if="!isAdmin">
      <div class="header-section">
        <h2>📷 智能打卡</h2>
        <p>扫码或拍照上传，系统将自动识别塑料种类并累计积分</p>
      </div>

      <div class="checkin-container">
        <div class="action-grid" v-if="!aiResult">
          <div class="action-card glass-panel" @click="triggerScan">
            <div class="icon">📱</div>
            <h3>扫码打卡</h3>
            <p>扫描站点二维码确认到达</p>
          </div>
          <div class="action-card glass-panel" @click="triggerAiCheck">
            <div class="icon">📸</div>
            <h3>拍照识别</h3>
            <p>AI 识别回收物种类与重量</p>
          </div>
        </div>

        <Transition name="fade">
          <div v-if="aiResult" class="result-panel glass-panel">
            <div class="result-header">
              <span class="check-icon">✅</span>
              <h3>识别成功</h3>
            </div>
            <div class="result-body">
              <div class="preview-img">
                <div class="scan-line"></div>
                <img src="../../assets/images/1.jpg" alt="Preview" />
              </div>
              <div class="info-list">
                <div class="info-item">
                  <span class="label">识别种类</span>
                  <span class="value">PET 塑料瓶 (透明)</span>
                </div>
                <div class="info-item">
                  <span class="label">预估重量</span>
                  <span class="value">0.45 kg</span>
                </div>
                <div class="info-item">
                  <span class="label">获得积分</span>
                  <span class="value highlight">+25 🪙</span>
                </div>
              </div>
            </div>
            <div class="result-footer">
              <button class="btn-ghost" @click="aiResult = false">重新拍照</button>
              <button class="btn-primary" @click="confirmCheckin">确认打卡</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 管理员视图 -->
    <div v-else>
      <div class="header-section">
        <h2>🛡️ 打卡审核与管理</h2>
        <div class="admin-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'audit' }]" 
            @click="activeTab = 'audit'"
          >打卡记录审核</button>
          <button 
            :class="['tab-btn', { active: activeTab === 'qrcode' }]" 
            @click="activeTab = 'qrcode'"
          >站点二维码管理</button>
        </div>
      </div>

      <div class="tab-content">
        <!-- 审核记录 -->
        <div v-if="activeTab === 'audit'" class="audit-section glass-panel">
          <table class="admin-table">
            <thead>
              <tr>
                <th>志愿者</th>
                <th>现场照片</th>
                <th>AI 结果</th>
                <th>打卡时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in mockRecords" :key="r.id">
                <td>{{ r.user }}</td>
                <td><img :src="r.img" class="record-thumb" @click="previewImg(r.img)" /></td>
                <td>{{ r.aiResult }}</td>
                <td>{{ r.time }}</td>
                <td>
                  <button class="btn-sm btn-success" @click="approve(r)">通过</button>
                  <button class="btn-sm btn-danger" @click="reject(r)">驳回</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 二维码管理 -->
        <div v-else class="qrcode-section glass-panel">
          <div class="qr-gen-form">
            <div class="input-group">
              <label>选择回收站点</label>
              <select v-model="selectedStation">
                <option value="1">湛山街道回收站</option>
                <option value="2">五四广场回收点</option>
                <option value="3">八大关环保站</option>
              </select>
            </div>
            <button class="btn-primary" @click="generateQR">生成/刷新二维码</button>
          </div>
          
          <div class="qr-display" v-if="qrCodeUrl">
            <div class="qr-card">
              <img :src="qrCodeUrl" alt="QR Code" />
              <p class="station-name">湛山街道回收站</p>
              <p class="qr-tip">请打印此二维码并张贴在回收箱侧面</p>
              <button class="btn-ghost btn-sm" @click="downloadQR">📥 下载二维码</button>
            </div>
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

const aiResult = ref(false);
const activeTab = ref('audit');
const selectedStation = ref('1');
const qrCodeUrl = ref('');

const triggerAiCheck = () => {
  // 模拟 AI 识别延迟
  setTimeout(() => {
    aiResult.value = true;
  }, 1500);
};

const triggerScan = () => {
  alert('正在启动摄像头扫码...');
};

const confirmCheckin = () => {
  alert('打卡成功！积分已发放。');
  aiResult.value = false;
};

const generateQR = () => {
  qrCodeUrl.value = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PureOcean_Station_001';
};

const downloadQR = () => {
  alert('二维码已开始下载');
};

// 模拟审核数据
const mockRecords = ref([
  { id: 1, user: '王小明', img: '/src/assets/images/1.jpg', aiResult: 'PET瓶 0.5kg', time: '10-26 14:20' },
  { id: 2, user: '陈美美', img: '/src/assets/images/2.jpg', aiResult: '混合塑料 1.2kg', time: '10-26 15:10' }
]);

const approve = (record: any) => {
  alert(`已通过 ${record.user} 的打卡申请`);
  mockRecords.value = mockRecords.value.filter(r => r.id !== record.id);
};

const reject = (record: any) => {
  if (confirm(`确定要驳回 ${record.user} 的打卡申请吗？`)) {
    mockRecords.value = mockRecords.value.filter(r => r.id !== record.id);
  }
};

const previewImg = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style scoped>
.checkin-view {
  padding: 10px;
}

.header-section {
  margin-bottom: 30px;
}

.header-section h2 {
  margin-bottom: 10px;
  background: linear-gradient(to right, #fff, #00b4db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-section p {
  color: #aaa;
}

/* 志愿者打卡样式 */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.action-card {
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: 0.3s;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
  border-color: #00e5ff;
}

.action-card .icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.result-panel {
  max-width: 500px;
  margin: 0 auto;
  padding: 30px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.check-icon {
  font-size: 1.5rem;
  background: #52c41a;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.preview-img {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.preview-img img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00e5ff;
  box-shadow: 0 0 15px #00e5ff;
  animation: scan 2s infinite linear;
}

@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}

.info-list {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:last-child { border: none; }
.label { color: #888; }
.highlight { color: #ffd700; font-weight: bold; }

.result-footer {
  display: flex;
  gap: 15px;
}

.result-footer button { flex: 1; }

/* 管理员样式 */
.admin-tabs {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.tab-btn {
  background: none;
  border: none;
  color: #888;
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #00e5ff;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00e5ff;
}

.audit-section, .qrcode-section {
  padding: 20px;
  margin-top: 20px;
}

.record-thumb {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.qr-gen-form {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 40px;
}

.qr-display {
  display: flex;
  justify-content: center;
}

.qr-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  color: #333;
}

.qr-card img {
  width: 200px;
  height: 200px;
  margin-bottom: 15px;
}

.qr-card .station-name {
  font-weight: bold;
  font-size: 1.2rem;
}

.qr-card .qr-tip {
  color: #666;
  font-size: 0.85rem;
  margin: 10px 0 20px;
}
</style>