<template>
  <div class="traceability-view">
    <!-- 志愿者视图 -->
    <div v-if="!isAdmin">
      <div class="header-section">
        <h2>🔍 溯源查询</h2>
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
                <h3>📜 批次信息</h3>
                <span class="status-badge" :class="searchResult.status">{{ searchResult.status === 'completed' ? '已完成' : '处理中' }}</span>
              </div>
              <div class="info-grid">
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
              </div>
            </div>

            <!-- 成就卡片 -->
            <div class="achievement-card glass-panel">
              <div class="achievement-icon">👚</div>
              <h3>环保成就</h3>
              <p>您的这次回收贡献将转化为</p>
              <div class="product-name">{{ searchResult.achievement.items }} 件再生 T 恤的原料</div>
              <div class="stats-mini">
                <span>减少碳排放 {{ searchResult.achievement.carbon }}kg</span>
                <span>节省石油 {{ searchResult.achievement.oil }}L</span>
              </div>
              <div class="hash-footer">
                <span class="label">🛡️ 数据已存证，真实可溯</span>
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

      <div class="trace-list glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>批次号</th>
              <th>当前状态</th>
              <th>来源站点</th>
              <th>重量</th>
              <th>数据校验</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in traceList" :key="t.batchNo">
              <td>{{ t.batchNo }}</td>
              <td>
                <span class="status-tag" :class="t.status === 'completed' ? 'verified' : 'pending'">
                  {{ t.status === 'completed' ? '已完成' : '处理中' }}
                </span>
              </td>
              <td>{{ t.stationName }}</td>
              <td>{{ t.weight }}</td>
              <td><span class="hash-tag" title="数据校验通过">✔️ 已存证</span></td>
            </tr>
          </tbody>
        </table>
      </div>
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
    handleSearch,
    fetchAdminList
} from './Traceability';

onMounted(() => {
  if (isAdmin.value) {
    fetchAdminList();
  }
});
</script>


<style scoped src="./Traceability.css"></style>
