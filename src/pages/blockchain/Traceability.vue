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
            <div class="trace-timeline glass-panel">
              <div 
                v-for="(item, index) in searchResult.timeline" 
                :key="index"
                class="timeline-item" 
                :class="item.status"
              >
                <div class="dot"></div>
                <div class="time">{{ item.time }}</div>
                <div class="content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </div>

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
                <span class="label">区块链哈希存证:</span>
                <span class="hash-value">{{ searchResult.achievement.hash }}</span>
              </div>
            </div>
          </template>
        </div>
      </Transition>
    </div>

    <!-- 管理员视图 -->
    <div v-else>
      <div class="header-section">
        <h2>🛡️ 溯源链管理</h2>
        <div class="admin-toolbar">
          <button class="btn-primary" @click="showLogisticsModal = true">📦 录入物流信息</button>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in blockchainData" :key="t.batch">
              <td>{{ t.batch }}</td>
              <td>
                <span class="status-tag" :class="t.status === 'completed' ? 'verified' : 'pending'">
                  {{ t.status === 'completed' ? '已完成' : '处理中' }}
                </span>
              </td>
              <td>{{ t.source }}</td>
              <td>管理员</td>
              <td><span class="hash-tag">已上链</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 物流录入模态框 -->
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
import {
    isAdmin,
    searchQuery,
    showResult,
    isLoading,
    searchError,
    searchResult,
    showLogisticsModal,
    newLogistics,
    blockchainData,
    handleSearch,
    saveLogistics
} from './Traceability';
</script>

<style scoped src="./Traceability.css"></style>
