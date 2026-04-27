<template>
  <div class="map-view">
    <div class="header">
       <div class="title-section">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          回收地图
        </h2>
        <span class="role-tag">{{ isAdmin ? '管理模式' : '志愿者模式' }}</span>
      </div>
      <div class="action-buttons">
        <!-- 志愿者操作 -->
        <template v-if="!isAdmin">
          <button class="btn-primary" @click="startPicking">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            申请新点位
          </button>
          <button class="btn-warning" @click="showIssueModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            报错/反馈
          </button>
        </template>
        <!-- 管理员操作 -->
        <template v-else>
          <button class="btn-primary" @click="startPicking">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><rect x="2" y="22" width="6" height="6"></rect><rect x="8" y="22" width="6" height="6"></rect><rect x="14" y="22" width="6" height="6"></rect><path d="M12 2l-9 9h6v7h6v-7h6z"></path></svg>
            新增回收站
          </button>
          <button class="btn-info" @click="showAuditModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            审核申请 ({{ pendingCount }})
          </button>
          <button class="btn-danger" @click="showErrorListModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            处理报错 ({{ errorCount }})
          </button>
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
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            请在地图上点击选择{{ isAdmin ? '新站位' : '申请位置' }}
          </span>
          <button class="btn-ghost btn-sm" @click="cancelPicking">取消</button>
        </div>

        <!-- Navigation Tip -->
        <div v-if="isNavigating" class="nav-tip">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            正在导航中...
          </span>
          <button class="btn-danger btn-sm" @click="stopNav">退出导航</button>
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
          <button class="search-btn" @click="handleSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="info-panel glass-panel">
        <div class="info-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {{ isAdmin ? '回收站状态管理' : '附近回收站' }}
          </h3>
        </div>
        <div class="station-list">
          <div v-for="s in mockStations" :key="s.id" class="station-item" @click="focusStation(s)">
            <div class="station-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </div>
            <div class="station-info">
              <div class="station-name">
                <span class="name-text">{{ s.name }}</span>
                <span v-if="isAdmin" :class="['status-tag', s.status]">{{ s.statusText }}</span>
              </div>
              <div class="station-addr">{{ s.address }}</div>
              <div class="station-actions" v-if="!isAdmin">
                <button class="btn-link" @click.stop="startNav(s)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                  导航
                </button>
                <button class="btn-link" @click.stop="openExternalMap(s)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  外部
                </button>
                <button class="btn-link warning" @click.stop="reportFull(s)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                  这里满了
                </button>
              </div>
              <div class="station-actions" v-else>
                <button class="btn-link" @click.stop="editStation(s)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  编辑
                </button>
                <button class="btn-link danger" @click.stop="deleteStation(s)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申报/新增模态框 -->
    <Transition name="fade">
      <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
        <div class="modal ocean-modal shadow-xl">
          <div class="modal-header ocean-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {{ isAdmin ? '新增回收站' : '申报新回收点' }}
            </h3>
            <span class="close-btn" @click="showReportModal = false">&times;</span>
          </div>
          <div class="modal-body ocean-body">
            <div class="input-group">
              <label>站点名称</label>
              <input type="text" v-model="reportForm.name" class="ocean-input" :placeholder="isAdmin ? '输入官方名称' : '例如：青岛路回收站'">
            </div>
            <div class="input-group">
              <label>详细地址</label>
              <input type="text" v-model="reportForm.address" class="ocean-input" placeholder="请输入详细地址">
            </div>
            <div class="input-group">
              <label>坐标拾取</label>
              <div class="coordinate-info ocean-coordinate">
                {{ reportForm.lng && reportForm.lat ? `${reportForm.lng.toFixed(4)}, ${reportForm.lat.toFixed(4)}` : '请在地图上点击选择位置' }}
              </div>
            </div>
          </div>
          <div class="modal-footer ocean-footer">
            <button class="ocean-btn-ghost" @click="showReportModal = false">取消</button>
            <button class="btn-primary ocean-btn" @click="submitReport">确认{{ isAdmin ? '创建' : '提交申报' }}</button>
          </div>
          <!-- 装饰元素 -->
          <div class="bubbles">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 报错反馈模态框 (志愿者) -->
    <Transition name="fade">
      <div v-if="showIssueModal" class="modal-overlay" @click.self="showIssueModal = false">
        <div class="modal ocean-modal shadow-xl">
          <div class="modal-header ocean-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; color: #faad14;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              站点报错反馈
            </h3>
            <span class="close-btn" @click="showIssueModal = false">&times;</span>
          </div>
          <div class="modal-body ocean-body">
            <div class="input-group">
              <label>选择站点</label>
              <select v-model="issueForm.stationId" class="ocean-input">
                <option v-for="s in mockStations" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>问题类型</label>
              <select v-model="issueForm.type" class="ocean-input">
                <option value="full">箱体已满</option>
                <option value="broken">设施损坏</option>
                <option value="dirty">周边脏乱</option>
                <option value="other">其他问题</option>
              </select>
            </div>
            <div class="input-group">
              <label>详细说明</label>
              <textarea v-model="issueForm.desc" class="ocean-input" placeholder="请描述具体情况..."></textarea>
            </div>
          </div>
          <div class="modal-footer ocean-footer">
            <button class="ocean-btn-ghost" @click="showIssueModal = false">取消</button>
            <button class="btn-primary ocean-btn" @click="submitIssue">提交反馈</button>
          </div>
          <!-- 装饰元素 -->
          <div class="bubbles">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 审核列表模态框 (管理员) -->
    <Transition name="fade">
      <div v-if="showAuditModal" class="modal-overlay" @click.self="showAuditModal = false">
        <div class="modal ocean-modal shadow-xl wide-modal">
          <div class="modal-header ocean-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              点位申请审核
            </h3>
            <span class="close-btn" @click="showAuditModal = false">&times;</span>
          </div>
          <div class="modal-body ocean-body">
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
                  <td>{{ formatDate(a.time) }}</td>
                  <td>
                    <div class="action-group">
                      <button class="btn-sm btn-success" @click="approveAudit(a)">通过</button>
                      <button class="btn-sm btn-danger" @click="rejectAudit(a)">拒绝</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 装饰元素 -->
          <div class="bubbles">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 报错处理模态框 (管理员) -->
    <Transition name="fade">
      <div v-if="showErrorListModal" class="modal-overlay" @click.self="showErrorListModal = false">
        <div class="modal ocean-modal shadow-xl wide-modal">
          <div class="modal-header ocean-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              报错反馈处理
            </h3>
            <span class="close-btn" @click="showErrorListModal = false">&times;</span>
          </div>
          <div class="modal-body ocean-body">
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
          <!-- 装饰元素 -->
          <div class="bubbles">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </Transition>
    <!-- 站点编辑模态框 (海洋特色) -->
    <Transition name="fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal ocean-modal shadow-xl">
          <div class="modal-header ocean-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              编辑回收站
            </h3>
            <span class="close-btn" @click="showEditModal = false">&times;</span>
          </div>
          <div class="modal-body ocean-body">
            <div class="input-group">
              <label>站点名称</label>
              <input type="text" v-model="editForm.name" class="ocean-input">
            </div>
            <div class="input-group">
              <label>详细地址</label>
              <input type="text" v-model="editForm.address" class="ocean-input">
            </div>
            <div class="input-group">
              <label>运行状态</label>
              <div class="status-selector">
                <label class="radio-label">
                  <input type="radio" v-model="editForm.status" value="normal">
                  <span class="radio-custom normal">正常运行</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="editForm.status" value="full">
                  <span class="radio-custom full">已满溢</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="editForm.status" value="maintenance">
                  <span class="radio-custom maintenance">维护中</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer ocean-footer">
            <button class="ocean-btn-ghost" @click="showEditModal = false">取消</button>
            <button class="btn-primary ocean-btn" @click="submitEdit">保存修改</button>
          </div>
          <!-- 装饰元素 -->
          <div class="bubbles">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 删除确认模态框 (海洋特色) -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal ocean-modal shadow-xl">
          <div class="modal-header ocean-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; color: #ff4757;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              确认删除
            </h3>
            <span class="close-btn" @click="showDeleteModal = false">&times;</span>
          </div>
          <div class="modal-body ocean-body">
            <div style="padding: 20px; text-align: center; color: #e6f7ff;">
              <p style="font-size: 1.1rem; margin-bottom: 10px;">确定要删除回收站 <span style="color: #00e5ff; font-weight: bold;">{{ deleteTarget?.name }}</span> 吗？</p>
              <p style="font-size: 0.9rem; opacity: 0.7;">此操作不可恢复，请谨慎操作。</p>
            </div>
          </div>
          <div class="modal-footer ocean-footer">
            <button class="ocean-btn-ghost" @click="showDeleteModal = false">取消</button>
            <button class="btn-danger" style="background: rgba(255, 71, 87, 0.2); border-color: #ff4757;" @click="confirmDelete">确认删除</button>
          </div>
           <!-- 装饰元素 -->
          <div class="bubbles">
            <span></span><span></span><span></span><span></span><span></span>
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
  showEditModal,
  isPickingLocation,
  loading,
  searchKey,
  reportForm,
  editForm,
  issueForm,
  mockStations,
  pendingAudits,
  pendingCount,
  errorCount,
  handleSearch,
  focusStation,
  submitReport,
  submitIssue,
  submitEdit,
  startPicking,
  cancelPicking,
  startNav,
  reportFull,
  editStation,
  deleteStation,
  confirmDelete,
  deleteTarget,
  showDeleteModal,
  approveAudit,
  rejectAudit,
  resolveReport,
  errorReports,
  formatDate
} = useMapLogic();
</script>

<style scoped src="./Map.css"></style>
