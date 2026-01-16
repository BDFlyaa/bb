<template>
  <div class="map-view">
    <div class="header">
      <div class="title-section">
        <h2>🗺️ 回收地图</h2>
        <span class="role-tag">{{ isAdmin ? '管理模式' : '志愿者模式' }}</span>
      </div>
      <div class="action-buttons">
        <!-- 志愿者操作 -->
        <template v-if="!isAdmin">
          <button class="btn-primary" @click="startPicking">➕ 申请新点位</button>
          <button class="btn-warning" @click="showIssueModal = true">⚠️ 报错/反馈</button>
        </template>
        <!-- 管理员操作 -->
        <template v-else>
          <button class="btn-primary" @click="startPicking">🏗️ 新增回收站</button>
          <button class="btn-info" @click="showAuditModal = true">📝 审核申请 ({{ pendingCount }})</button>
          <button class="btn-danger" @click="showErrorListModal = true">🛠️ 处理报错 ({{ errorCount }})</button>
        </template>
      </div>
    </div>
    
    <div class="map-layout">
      <!-- Map Container -->
      <div id="container" class="map-container glass-panel">
        <div v-if="loading" class="map-loading">
          <div class="loader"></div>
          <p>正在加载高德地图...</p>
        </div>

        <!-- Picking Location Hint -->
        <div v-if="isPickingLocation" class="picking-tip">
          <span>📍 请在地图上点击选择{{ isAdmin ? '新站位' : '申请位置' }}</span>
          <button class="btn-ghost btn-sm" @click="cancelPicking">取消</button>
        </div>

        <!-- Search Bar Overlay -->
        <div class="map-search-bar" v-if="!loading">
          <input 
            type="text" 
            id="tipinput" 
            v-model="searchKey" 
            placeholder="搜索地点、回收站..."
            @keyup.enter="handleSearch"
          >
          <button class="search-btn" @click="handleSearch">🔍</button>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="info-panel glass-panel">
        <div class="info-header">
          <h3>📍 {{ isAdmin ? '回收站状态管理' : '附近回收站' }}</h3>
        </div>
        <div class="station-list">
          <div v-for="s in mockStations" :key="s.id" class="station-item" @click="focusStation(s)">
            <div class="station-icon">♻️</div>
            <div class="station-info">
              <div class="station-name">
                {{ s.name }}
                <span v-if="isAdmin" :class="['status-tag', s.status]">{{ s.statusText }}</span>
              </div>
              <div class="station-addr">{{ s.address }}</div>
              <div class="station-actions" v-if="!isAdmin">
                <button class="btn-link" @click.stop="startNav(s)">🚗 导航</button>
                <button class="btn-link warning" @click.stop="reportFull(s)">🚩 这里满了</button>
              </div>
              <div class="station-actions" v-else>
                <button class="btn-link" @click.stop="editStation(s)">✏️ 编辑</button>
                <button class="btn-link danger" @click.stop="deleteStation(s)">🗑️ 删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申报/新增模态框 -->
    <Transition name="fade">
      <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
        <div class="modal glass-panel shadow-xl">
          <div class="modal-header">
            <h3>{{ isAdmin ? '新增回收站' : '申报新回收点' }}</h3>
            <span class="close-btn" @click="showReportModal = false">&times;</span>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>站点名称</label>
              <input type="text" v-model="reportForm.name" :placeholder="isAdmin ? '输入官方名称' : '例如：青岛路回收站'">
            </div>
            <div class="input-group">
              <label>详细地址</label>
              <input type="text" v-model="reportForm.address" placeholder="请输入详细地址">
            </div>
            <div class="input-group">
              <label>坐标拾取</label>
              <div class="coordinate-info">
                {{ reportForm.lng && reportForm.lat ? `${reportForm.lng.toFixed(4)}, ${reportForm.lat.toFixed(4)}` : '请在地图上点击选择位置' }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="showReportModal = false">取消</button>
            <button class="btn-primary" @click="submitReport">确认{{ isAdmin ? '创建' : '提交申报' }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 报错反馈模态框 (志愿者) -->
    <Transition name="fade">
      <div v-if="showIssueModal" class="modal-overlay" @click.self="showIssueModal = false">
        <div class="modal glass-panel shadow-xl">
          <div class="modal-header">
            <h3>⚠️ 站点报错反馈</h3>
            <span class="close-btn" @click="showIssueModal = false">&times;</span>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>选择站点</label>
              <select v-model="issueForm.stationId">
                <option v-for="s in mockStations" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>问题类型</label>
              <select v-model="issueForm.type">
                <option value="full">箱体已满</option>
                <option value="broken">设施损坏</option>
                <option value="dirty">周边脏乱</option>
                <option value="other">其他问题</option>
              </select>
            </div>
            <div class="input-group">
              <label>详细说明</label>
              <textarea v-model="issueForm.desc" placeholder="请描述具体情况..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="showIssueModal = false">取消</button>
            <button class="btn-primary" @click="submitIssue">提交反馈</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 审核列表模态框 (管理员) -->
    <Transition name="fade">
      <div v-if="showAuditModal" class="modal-overlay" @click.self="showAuditModal = false">
        <div class="modal glass-panel shadow-xl wide-modal">
          <div class="modal-header">
            <h3>📝 点位申请审核</h3>
            <span class="close-btn" @click="showAuditModal = false">&times;</span>
          </div>
          <div class="modal-body">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>申请人</th>
                  <th>建议名称</th>
                  <th>地址</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in pendingAudits" :key="a.id">
                  <td>{{ a.user }}</td>
                  <td>{{ a.name }}</td>
                  <td>{{ a.address }}</td>
                  <td>{{ a.time }}</td>
                  <td>
                    <button class="btn-sm btn-success" @click="approveAudit(a)">通过</button>
                    <button class="btn-sm btn-danger" @click="rejectAudit(a)">拒绝</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 报错处理模态框 (管理员) -->
    <Transition name="fade">
      <div v-if="showErrorListModal" class="modal-overlay" @click.self="showErrorListModal = false">
        <div class="modal glass-panel shadow-xl wide-modal">
          <div class="modal-header">
            <h3>🛠️ 报错反馈处理</h3>
            <span class="close-btn" @click="showErrorListModal = false">&times;</span>
          </div>
          <div class="modal-body">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>反馈人</th>
                  <th>相关站点</th>
                  <th>类型</th>
                  <th>描述</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in errorReports" :key="r.id">
                  <td>{{ r.user }}</td>
                  <td>{{ r.stationName }}</td>
                  <td>{{ r.type }}</td>
                  <td>{{ r.desc }}</td>
                  <td>
                    <button class="btn-sm btn-success" @click="resolveReport(r)">已处理</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMapLogic } from './Map';

const {
  isAdmin,
  showReportModal,
  showIssueModal,
  showAuditModal,
  showErrorListModal,
  isPickingLocation,
  loading,
  searchKey,
  reportForm,
  issueForm,
  mockStations,
  pendingAudits,
  pendingCount,
  errorCount,
  handleSearch,
  focusStation,
  submitReport,
  submitIssue,
  startPicking,
  cancelPicking,
  startNav,
  reportFull,
  editStation,
  deleteStation,
  approveAudit,
  rejectAudit,
  resolveReport,
  errorReports
} = useMapLogic();
</script>

<style scoped src="./Map.css"></style>
