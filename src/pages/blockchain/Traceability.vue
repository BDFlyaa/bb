<template>
  <div class="traceability-view">
    <!-- 志愿者视图 -->
    <div v-if="!isAdmin">
      <div class="header-section">
        <h2>
          <svg class="title-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          溯源查询
        </h2>
        <p>输入您的回收批次号，查看资源再生详情</p>
      </div>

      <div class="search-container">
        <div class="search-box glass-panel">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="输入批次号，例如: B-20231024-00001" 
            @keyup.enter="handleSearch"
          />
          <button class="btn-primary" @click="handleSearch" :disabled="isLoading">
             {{ isLoading ? '查询中...' : '立即查询' }}
          </button>
        </div>
      </div>

      <!-- 结果展示区域 -->
      <Transition name="slide-up">
        <div v-if="showResult" class="result-container">
          
          <!-- 错误提示 -->
          <div v-if="searchError" class="error-message glass-panel">
            ⚠️ {{ searchError }}
          </div>

          <!-- 成功结果 -->
          <template v-else-if="searchResult">
            <!-- 基础信息卡片 -->
            <div class="trace-info glass-panel">
              <div class="info-header">
                <h3>
                  <svg class="header-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  批次详情
                </h3>
                <span class="status-badge" :class="searchResult.status">{{ searchResult.status === 'completed' ? '已完成' : '处理中' }}</span>
              </div>
              
              <div class="trace-detail-layout">
                <div class="trace-image">
                  <img 
                    v-if="searchResult.imageUrl" 
                    :src="searchResult.imageUrl" 
                    alt="回收实拍" 
                    @error="handleImageError"
                  />
                  <div v-else class="image-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span>暂无现场照片</span>
                  </div>
                  <div class="image-label">回收现场实拍</div>
                </div>

                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">回收志愿者</span>
                    <span class="value">{{ searchResult.userName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">回收物类型</span>
                    <span class="value">{{ searchResult.type }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">批次编号</span>
                    <span class="value">{{ searchResult.batchNo }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">回收站点</span>
                    <span class="value">{{ searchResult.stationName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">回收时间</span>
                    <span class="value">{{ searchResult.checkinTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">回收重量</span>
                    <span class="value">{{ searchResult.weight }} kg</span>
                  </div>
                  <div class="info-item full">
                    <span class="label">数据校验码 (SHA256)</span>
                    <span class="value mono small">{{ searchResult.hashDigest }}</span>
                  </div>
                  <div class="info-item full">
                    <span class="label">🛡️ 数据已通过区块链存证，真实可靠</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </Transition>
    </div>

    <!-- 管理员视图 -->
    <div v-else>
      <div class="header-section">
        <h2>🗂️ 溯源记录管理</h2>
        <p>查看系统中的所有回收溯源记录</p>
      </div>

      <div class="admin-actions">
        <button class="btn-primary" @click="openCreateDialog">➕ 新增记录</button>
        <button class="btn-secondary" @click="exportReport">📥 导出报表</button>
      </div>

      <div class="trace-list glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>批次号</th>
              <th>回收图片</th>
              <th>当前状态</th>
              <th>来源站点</th>
              <th>重量 (kg)</th>
              <th>数据校验</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in traceList" :key="t.batchNo">
              <td>{{ t.batchNo }}</td>
              <td>
                <div class="table-img-container">
                  <img v-if="t.imageUrl" :src="t.imageUrl" alt="回收图片" class="table-thumbnail" @click="viewImage(t.imageUrl)" />
                  <span v-else class="no-img">无图片</span>
                </div>
              </td>
              <td>
                <span class="status-tag" :class="t.status === 'completed' ? 'verified' : 'pending'">
                  {{ t.status === 'completed' ? '已完成' : '处理中' }}
                </span>
              </td>
              <td>{{ t.stationName }}</td>
              <td>{{ t.weight }}</td>
              <td><span class="hash-tag" title="数据校验通过">✔️ 已存证</span></td>
              <td class="actions">
                <button class="btn-text" @click="openEditDialog(t)">修改</button>
                <button class="btn-text delete" @click="deleteRecord(t.batchNo)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 编辑/新增 弹窗 -->
      <Transition name="fade">
        <div v-if="isDialogOpen" class="modal-overlay" @click.self="isDialogOpen = false">
          <div class="modal-content glass-panel">
            <h3>{{ isEditing ? '编辑溯源记录' : '新增溯源记录' }}</h3>
            <div class="form-grid">
              <div class="form-item">
                <label>来源站点</label>
                <select v-model="currentRecord.stationId">
                  <option :value="null">-- 非官方点位 (个人清理) --</option>
                  <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div class="form-item">
                <label>回收物类型</label>
                <input type="text" v-model="currentRecord.wasteType" placeholder="如: 塑料瓶, 渔网" />
              </div>
              <div class="form-item">
                <label>重量 (kg)</label>
                <input type="number" v-model="currentRecord.weight" step="0.1" />
              </div>
              <div class="form-item">
                <label>状态</label>
                <select v-model="currentRecord.status">
                  <option value="processing">处理中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              <div class="form-item" v-if="isEditing">
                <label>批次号</label>
                <input type="text" v-model="currentRecord.batchNo" disabled />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="isDialogOpen = false">取消</button>
              <button class="btn-primary" @click="saveRecord" :disabled="isLoading">
                {{ isLoading ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 图片查看器 -->
      <Transition name="fade">
        <div v-if="isImageViewerOpen" class="image-viewer-overlay" @click="isImageViewerOpen = false">
          <div class="image-viewer-content" @click.stop>
            <img :src="viewerImageUrl" alt="全屏查看" />
            <button class="close-viewer" @click="isImageViewerOpen = false">×</button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
    isAdmin,
    searchQuery,
    showResult,
    isLoading,
    searchError,
    searchResult,
    traceList,
    stations,
    isDialogOpen,
    isEditing,
    currentRecord,
    openCreateDialog,
    openEditDialog,
    saveRecord,
    deleteRecord,
    exportReport,
    handleSearch,
    handleImageError,
    fetchAdminList,
    loadStations,
    viewImage,
    isImageViewerOpen,
    viewerImageUrl
} from './Traceability';

onMounted(() => {
  if (isAdmin.value) {
    fetchAdminList();
    loadStations();
  }
});
</script>


<style scoped src="./Traceability.css"></style>
