<template>
  <div class="checkin-view">
    <!-- 全局 Toast -->
    <Transition name="slide-down">
      <div v-if="toast.show" :class="['toast-message', toast.type]">
        <span class="toast-icon">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
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
              <div class="card-bg-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
              <div class="icon-wrapper">
                <span class="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                </span>
                <div class="ripple"></div>
              </div>
              <h3>扫码打卡</h3>
              <p>扫描站点二维码签到</p>
            </div>
            
            <div class="action-card glass-panel ai-card" @click="triggerUpload">
              <div class="card-bg-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
              <div class="icon-wrapper">
                <span class="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </span>
                <div class="ripple"></div>
              </div>
              <h3>拍照识别</h3>
              <p>上传图片 AI 识别</p>
            </div>
          </div>

          <!-- 识别结果区 -->
          <div v-else class="result-panel glass-panel" key="result">
            <div class="result-header">
              <span class="check-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              </span>
              <h3>识别完成</h3>
            </div>
            <div class="result-body">
              <div class="preview-img">
                <div class="scan-line"></div>
                <div class="tech-border"></div>
                <img :src="uploadedImageUrl || '../../assets/images/1.jpg'" alt="Preview" />
              </div>
              <div class="info-list" v-if="recognitionResult">
                <div class="info-item">
                  <span class="label">垃圾分类</span>
                  <span class="value category-tag">{{ recognitionResult.category }}</span>
                </div>
                <div class="info-item">
                  <span class="label">识别种类</span>
                  <span class="value">{{ recognitionResult.rubbishName }} ({{ recognitionResult.confidence }}%)</span>
                </div>
                <div class="info-item">
                  <span class="label">预估重量</span>
                  <span class="value">{{ recognitionResult.estimatedWeight }} kg</span>
                </div>
                <div class="info-item highlight-item">
                  <span class="label">获得积分</span>
                  <span class="value highlight">
                    +{{ recognitionResult.points }} 
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="2"></line></svg>
                  </span>
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
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-1.21 3.8-2 6.38V16h-5z"></path><path d="M16.2 13c.81 2.16 2.3 3.6 3.8 3.6h.4l-.4 3.4a2 2 0 0 1-3.98.2l-.3-2.6c-.6-4.4-3.7-6.2-3.7-9.6 0-2.4 1-4 3-4 3.3 0 4.6 3.6 4.6 6 0 1.2-.4 2.2-1 3.2z"></path></svg>
              今日足迹
            </span>
          </div>
          <div class="history-list">
            <div v-for="item in recentHistory" :key="item.id" class="history-item">
              <div class="item-icon">
                <svg v-if="item.type.includes('扫码')" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              </div>
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
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            打卡审核与管理
          </h2>
          <span class="badge">Admin Panel</span>
        </div>
        <div class="admin-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'audit' }]" 
            @click="activeTab = 'audit'"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
            </span> 打卡审核
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'qrcode' }]" 
            @click="activeTab = 'qrcode'"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </span> 站点管理
          </button>
        </div>
      </div>

      <div class="tab-content">
        <!-- 审核记录 -->
        <Transition name="fade" mode="out-in">
          <div v-if="activeTab === 'audit'" class="audit-section-container" key="audit">
            <!-- 统计卡片 -->
            <div class="stats-cards">
              <div 
                :class="['stat-card', 'glass-panel', 'pending', { active: auditFilter === 'pending' }]"
                @click="setAuditFilter('pending')"
              >
                <div class="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div class="stat-info">
                  <span class="label">待审核</span>
                  <span class="value">{{ auditStats.pending }}</span>
                </div>
              </div>
              <div 
                :class="['stat-card', 'glass-panel', 'approved', { active: auditFilter === 'approved' }]"
                @click="setAuditFilter('approved')"
              >
                <div class="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div class="stat-info">
                  <span class="label">今日通过</span>
                  <span class="value">{{ auditStats.approved }}</span>
                </div>
              </div>
              <div 
                :class="['stat-card', 'glass-panel', 'rejected', { active: auditFilter === 'rejected' }]"
                @click="setAuditFilter('rejected')"
              >
                <div class="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                </div>
                <div class="stat-info">
                  <span class="label">今日驳回</span>
                  <span class="value">{{ auditStats.rejected }}</span>
                </div>
              </div>
            </div>

            <div class="audit-list glass-panel">
              <div class="section-header">
                <h3>{{ sectionTitle }}</h3>
              </div>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>志愿者</th>
                    <th>现场照片</th>
                    <th>AI 识别结果</th>
                    <th>提交时间</th>
                    <th v-if="auditFilter === 'pending'">操作</th>
                    <th v-else>状态</th>
                  </tr>
                </thead>
                <TransitionGroup name="list" tag="tbody">
                  <tr v-for="r in auditRecords" :key="r.id">
                    <td>
                      <div class="user-cell">
                        <div class="avatar-circle">{{ r.user.charAt(0) }}</div>
                        <span class="username">{{ r.user }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="thumb-wrapper" @click="previewImg(r.img)">
                        <img :src="r.img" class="record-thumb" />
                        <div class="overlay">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="ai-tag">{{ r.aiResult }}</span>
                    </td>
                    <td class="time-text">{{ r.time }}</td>
                    <td>
                      <div v-if="auditFilter === 'pending'" class="action-group">
                        <button class="btn-icon approve" @click="approve(r)" title="通过">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                        <button class="btn-icon reject" @click="reject(r)" title="驳回">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      <div v-else class="status-badge" :class="r.status">
                         {{ r.status === 'approved' ? '已通过' : '已驳回' }}
                      </div>
                    </td>
                  </tr>
                  <tr v-if="auditRecords.length === 0" key="empty">
                    <td colspan="5" class="empty-cell">
                      <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: text-bottom;"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                        当前没有{{ sectionTitle.replace('申请', '') }}记录
                      </div>
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
                    <span class="arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </div>
                </div>
                
                <button class="btn-primary full-width" @click="generateQR">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    生成二维码
                  </span>
                </button>
              </div>
              
              <div class="preview-panel">
                <div class="qr-display" v-if="qrCodeUrl">
                  <div class="qr-card">
                    <div class="card-header">
                      <span class="brand">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                        PureOcean
                      </span>
                    </div>
                    <div class="qr-wrapper">
                      <img :src="qrCodeUrl" alt="QR Code" />
                    </div>
                    <div class="card-info">
                      <h4 class="station-name">湛山街道回收站</h4>
                      <p class="qr-tip">扫码打卡 · 自动积分</p>
                    </div>
                    <div class="card-footer">
                      <button class="btn-download" @click="downloadQR">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        下载海报
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="placeholder-box">
                  <span class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  </span>
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
    recognitionResult,
    // 管理员
  activeTab,
  selectedStation,
  qrCodeUrl,
  generateQR,
  downloadQR,
  auditRecords,
  auditFilter,
  sectionTitle,
  setAuditFilter,
  auditStats,
  previewImageState,
  approve,
  reject,
  previewImg,
  closePreview
} = useCheckin();
</script>

<style scoped src="./Checkin.css"></style>
