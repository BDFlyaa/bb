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
          <div v-if="activeTab === 'audit'" class="audit-section glass-panel" key="audit">
            <div class="section-header">
              <h3>待处理申请 <span class="count">{{ mockRecords.length }}</span></h3>
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
              <tbody>
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
                <tr v-if="mockRecords.length === 0">
                  <td colspan="5" class="empty-cell">
                    <div class="empty-state">🎉 当前没有待审核的记录</div>
                  </td>
                </tr>
              </tbody>
            </table>
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
  </div>
</template>

<script setup lang="ts">
import { useCheckin } from './Checkin';

const {
  isAdmin,
  aiResult,
  activeTab,
  selectedStation,
  qrCodeUrl,
  triggerAiCheck,
  triggerScan,
  confirmCheckin,
  generateQR,
  downloadQR,
  mockRecords,
  approve,
  reject,
  previewImg
} = useCheckin();
</script>

<style scoped src="./Checkin.css"></style>
