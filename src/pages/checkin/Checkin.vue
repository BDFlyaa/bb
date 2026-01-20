<template>
  <div class="checkin-view">
    <!-- 全局 Toast -->
    <Transition name="slide-down">
      <div v-if="toast.show" :class="['toast-message', toast.type]">
        <span class="toast-icon">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}
        </span>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- 隐藏的文件输入框 -->
    <input 
      type="file" 
      ref="fileInput" 
      accept="image/*" 
      style="display: none" 
      @change="handleFileChange" 
    />

    <!-- 志愿者视图 -->
    <div v-if="!isAdmin" class="volunteer-view-container">
      <!-- 动态背景装饰 -->
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>

      <div class="header-section volunteer-header">
        <div class="time-display">{{ currentTime }}</div>
        <div class="greeting-area">
          <h2>{{ greeting }}，志愿者</h2>
          <p>每一次打卡，都是对海洋的一份承诺</p>
        </div>
      </div>

      <div class="checkin-container">
        <!-- 操作区 -->
        <Transition name="fade" mode="out-in">
          <div v-if="!aiResult" class="action-grid" key="actions">
            <div class="action-card glass-panel scan-card" @click="triggerScan">
              <div class="card-bg-icon">📱</div>
              <div class="icon-wrapper">
                <span class="icon">📱</span>
                <div class="ripple"></div>
              </div>
              <h3>扫码打卡</h3>
              <p>扫描站点二维码签到</p>
            </div>
            
            <div class="action-card glass-panel ai-card" @click="triggerUpload">
              <div class="card-bg-icon">📸</div>
              <div class="icon-wrapper">
                <span class="icon">📸</span>
                <div class="ripple"></div>
              </div>
              <h3>拍照识别</h3>
              <p>上传图片 AI 识别</p>
            </div>
          </div>

          <!-- 识别结果区 -->
          <div v-else class="result-panel glass-panel" key="result">
            <div class="result-header">
              <span class="check-icon">✨</span>
              <h3>识别完成</h3>
            </div>
            <div class="result-body">
              <div class="preview-img">
                <div class="scan-line"></div>
                <div class="tech-border"></div>
                <img :src="uploadedImageUrl || '../../assets/images/1.jpg'" alt="Preview" />
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
                <div class="info-item highlight-item">
                  <span class="label">获得积分</span>
                  <span class="value highlight">+25 🪙</span>
                </div>
              </div>
            </div>
            <div class="result-footer">
              <button class="btn-ghost" @click="aiResult = false">重新拍摄</button>
              <button class="btn-primary glow-effect" @click="confirmCheckin">确认打卡</button>
            </div>
          </div>
        </Transition>

        <!-- 历史记录 -->
        <div class="history-section glass-panel">
          <div class="section-title">
            <span>👣 今日足迹</span>
          </div>
          <div class="history-list">
            <div v-for="item in recentHistory" :key="item.id" class="history-item">
              <div class="item-icon">{{ item.type.includes('扫码') ? '📱' : '♻️' }}</div>
              <div class="item-info">
                <span class="station">{{ item.station }}</span>
                <span class="time">{{ item.time }} · {{ item.type }}</span>
              </div>
              <div class="item-points">+{{ item.points }}</div>
            </div>
            <div v-if="recentHistory.length === 0" class="empty-history">
              暂无今日记录
            </div>
          </div>
        </div>
      </div>

      <!-- 全屏扫描/加载遮罩 -->
      <Transition name="fade">
        <div v-if="isScanning || isAnalyzing" :class="['loading-overlay', { 'scanning-mode': isScanning }]">
          <!-- 扫码模式 -->
          <div v-if="isScanning" class="scanner-container">
            <div class="scan-window">
              <div class="scan-corners">
                <span></span><span></span><span></span><span></span>
              </div>
              <div class="scan-bar"></div>
              <div class="scan-tip">将二维码放入框内即可自动扫描</div>
            </div>
            <div class="scanner-footer">
              <button class="btn-cancel-scan" @click="cancelScan">取消扫描</button>
            </div>
          </div>

          <!-- AI 分析模式 -->
          <div v-else class="loader-content">
            <div class="radar-scan"></div>
            <p>AI 正在分析图像...</p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 管理员视图 -->
    <div v-else class="admin-view-container">
      <div class="header-section admin-header">
        <div class="header-title">
          <h2>🛡️ 打卡审核与管理</h2>
          <span class="badge">Admin Panel</span>
        </div>
        <div class="admin-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'audit' }]" 
            @click="activeTab = 'audit'"
          >
            <span class="icon">📋</span> 打卡审核
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'qrcode' }]" 
            @click="activeTab = 'qrcode'"
          >
            <span class="icon">🏁</span> 站点管理
          </button>
        </div>
      </div>

      <div class="tab-content">
        <!-- 审核记录 -->
        <Transition name="fade" mode="out-in">
          <div v-if="activeTab === 'audit'" class="audit-section-container" key="audit">
            <!-- 统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card glass-panel pending">
                <div class="stat-icon">⏳</div>
                <div class="stat-info">
                  <span class="label">待审核</span>
                  <span class="value">{{ auditStats.pending }}</span>
                </div>
              </div>
              <div class="stat-card glass-panel approved">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                  <span class="label">今日通过</span>
                  <span class="value">{{ auditStats.approved }}</span>
                </div>
              </div>
              <div class="stat-card glass-panel rejected">
                <div class="stat-icon">🚫</div>
                <div class="stat-info">
                  <span class="label">今日驳回</span>
                  <span class="value">{{ auditStats.rejected }}</span>
                </div>
              </div>
            </div>

            <div class="audit-list glass-panel">
              <div class="section-header">
                <h3>待处理申请</h3>
              </div>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>志愿者</th>
                    <th>现场照片</th>
                    <th>AI 识别结果</th>
                    <th>提交时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <TransitionGroup name="list" tag="tbody">
                  <tr v-for="r in mockRecords" :key="r.id">
                    <td>
                      <div class="user-cell">
                        <div class="avatar-circle">{{ r.user.charAt(0) }}</div>
                        <span class="username">{{ r.user }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="thumb-wrapper" @click="previewImg(r.img)">
                        <img :src="r.img" class="record-thumb" />
                        <div class="overlay">👁️</div>
                      </div>
                    </td>
                    <td>
                      <span class="ai-tag">{{ r.aiResult }}</span>
                    </td>
                    <td class="time-text">{{ r.time }}</td>
                    <td>
                      <div class="action-group">
                        <button class="btn-icon approve" @click="approve(r)" title="通过">✓</button>
                        <button class="btn-icon reject" @click="reject(r)" title="驳回">✕</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="mockRecords.length === 0" key="empty">
                    <td colspan="5" class="empty-cell">
                      <div class="empty-state">🎉 当前没有待审核的记录</div>
                    </td>
                  </tr>
                </TransitionGroup>
              </table>
            </div>
          </div>

          <!-- 二维码管理 -->
          <div v-else class="qrcode-section glass-panel" key="qrcode">
            <div class="split-layout">
              <div class="config-panel">
                <h3>生成站点二维码</h3>
                <p class="desc">选择一个回收站点生成专属打卡二维码，志愿者扫码即可快速打卡。</p>
                
                <div class="form-group">
                  <label>选择回收站点</label>
                  <div class="select-wrapper">
                    <select v-model="selectedStation">
                      <option value="1">湛山街道回收站</option>
                      <option value="2">五四广场回收点</option>
                      <option value="3">八大关环保站</option>
                    </select>
                    <span class="arrow">▼</span>
                  </div>
                </div>
                
                <button class="btn-primary full-width" @click="generateQR">
                  <span>✨ 生成二维码</span>
                </button>
              </div>
              
              <div class="preview-panel">
                <div class="qr-display" v-if="qrCodeUrl">
                  <div class="qr-card">
                    <div class="card-header">
                      <span class="brand">♻️ PureOcean</span>
                    </div>
                    <div class="qr-wrapper">
                      <img :src="qrCodeUrl" alt="QR Code" />
                    </div>
                    <div class="card-info">
                      <h4 class="station-name">湛山街道回收站</h4>
                      <p class="qr-tip">扫码打卡 · 自动积分</p>
                    </div>
                    <div class="card-footer">
                      <button class="btn-download" @click="downloadQR">📥 下载海报</button>
                    </div>
                  </div>
                </div>
                <div v-else class="placeholder-box">
                  <span class="icon">👈</span>
                  <p>请在左侧选择站点并生成</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <Transition name="fade">
      <div v-if="previewImageState.show" class="image-modal" @click="closePreview">
        <div class="modal-content">
          <img :src="previewImageState.url" alt="Preview Full" />
          <button class="close-btn" @click.stop="closePreview">×</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCheckin } from './Checkin';

const fileInput = ref<HTMLInputElement | null>(null);

const triggerUpload = () => {
  fileInput.value?.click();
};

const {
    isAdmin,
    // 通用
    currentTime,
    greeting,
    toast,
    // 志愿者
    aiResult,
    isScanning,
    isAnalyzing,
    recentHistory,
    handleFileChange,
    uploadedImageUrl,
    triggerScan,
    cancelScan,
    confirmCheckin,
    // 管理员
  activeTab,
  selectedStation,
  qrCodeUrl,
  generateQR,
  downloadQR,
  mockRecords,
  auditStats,
  previewImageState,
  approve,
  reject,
  previewImg,
  closePreview
} = useCheckin();
</script>

<style scoped src="./Checkin.css"></style>
