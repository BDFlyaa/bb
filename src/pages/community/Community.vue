<template>
  <div class="community-view">
    <!-- 加载遮罩 -->
    <div v-if="logic.isLoading.value" class="loading-overlay">
      <span class="loader"></span>
      <p>正在同步海域动态...</p>
    </div>

    <!-- 志愿者视图 -->
    <div v-if="!isAdmin">
      <div class="header-section">
        <div class="title-area">
          <h2>🌱 志愿者社区</h2>
          <p>守护蔚蓝，分享每一份环保力量</p>
        </div>
      </div>

      <div class="community-layout">
        <!-- 左侧：任务列表 -->
        <div class="task-column">
          <div class="column-header">
          </div>
          <div class="task-list">
            <div v-for="task in logic.tasks.value" :key="task.id" class="glass-panel task-card">
              <div class="task-header">
                <span class="task-tag">官方任务</span>
                <span class="task-date">{{ task.date }}</span>
              </div>
              <h4>{{ task.title }}</h4>
              <p class="task-loc">📍 {{ task.loc }}</p>
              <button v-if="!task.isJoined" @click="logic.joinTask(task)" class="btn-primary full-width">报名参加</button>
              <button v-else @click="logic.leaveTask(task)" class="btn-ghost full-width">已参加 (退出)</button>
            </div>
          </div>
        </div>

        <!-- 中间：动态流 -->
        <div class="feed-column">
          <!-- 发布卡片 -->
          <div class="glass-panel publish-card">
            <textarea 
              v-model="logic.newPostContent.value" 
              placeholder="分享你的环保瞬间..."
              :disabled="logic.isPublishing.value"
            ></textarea>
            
            <div v-if="logic.selectedImage.value" class="image-preview-container">
              <img :src="logic.selectedImage.value" />
              <span class="remove-img" @click="logic.selectedImage.value = ''">×</span>
            </div>

            <div class="publish-footer">
              <div class="publish-options">
                <label class="opt-icon" title="上传图片">
                  <input type="file" hidden @change="logic.handleImageSelect" accept="image/*" />
                  📷 <span style="font-size: 0.8rem; margin-left: 5px;">图片</span>
                </label>
              </div>
              <button 
                class="btn-primary" 
                @click="logic.publishPost" 
                :disabled="logic.isPublishing.value || (!logic.newPostContent.value.trim() && !logic.selectedImage.value)"
              >
                {{ logic.isPublishing.value ? '发布中...' : '发布动态' }}
              </button>
            </div>
          </div>

          <!-- 动态列表 -->
          <div class="feed-list">
            <div v-for="post in logic.feed.value" :key="post.id" class="glass-panel feed-item">
              <div class="feed-header">
                <div class="user-info" style="display: flex; gap: 10px; align-items: center;">
                  <div class="avatar" style="font-size: 1.5rem;">👤</div>
                  <div class="meta">
                    <div class="username" style="font-weight: bold; color: #00b4db;">{{ post.user }}</div>
                    <div class="time-ago">{{ logic.formatTime(post.createdAt) }}</div>
                  </div>
                </div>
                <!-- 如果是自己的动态，可以删除 -->
                <button v-if="post.user === store.user.name" class="btn-more" @click="logic.deletePost(post.id)">删除</button>
              </div>

              <div class="feed-content">{{ post.content }}</div>
              
              <div v-if="post.image" class="feed-image" @click="logic.openImagePreview(post.image)">
                <img :src="post.image" loading="lazy" />
              </div>

              <div class="feed-actions">
                <div 
                  class="action-item" 
                  :class="{ liked: post.isLiked }"
                  @click="logic.toggleLike(post)"
                >
                  {{ post.isLiked ? '❤️' : '🤍' }} {{ post.likes }}
                </div>
                <div class="action-item" @click="logic.toggleComments(post)">
                  💬 {{ post.comments?.length || 0 }}
                </div>
                <div class="action-item">🔗 分享</div>
              </div>

              <!-- 评论区 -->
              <div v-if="post.showComments" class="comment-section">
                <div class="comment-list">
                  <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                      <span class="comment-user">{{ comment.user }}</span>
                      <span class="comment-time">{{ logic.formatTime(comment.createdAt) }}</span>
                    </div>
                    <p class="comment-content">{{ comment.content }}</p>
                  </div>
                  <div v-if="!post.comments?.length" class="no-comments">暂无评论，快来抢沙发吧~</div>
                </div>
                
                <div class="comment-input-area">
                  <input 
                    v-model="post.newCommentContent" 
                    type="text" 
                    placeholder="说点什么吧..." 
                    @keyup.enter="logic.addComment(post)"
                  />
                  <button 
                    class="btn-primary btn-sm" 
                    @click="logic.addComment(post)"
                    :disabled="!post.newCommentContent?.trim()"
                  >发送</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：排行榜 -->
        <div class="rank-column">
          <div class="glass-panel sidebar-card">
            <h3 style="margin-bottom: 20px; color: #00e5ff;">🏆 贡献排行榜</h3>
            <div class="rank-list" style="display: flex; flex-direction: column; gap: 15px;">
              <div v-for="(rank, index) in logic.rankings.value" :key="rank.id" class="rank-item" style="display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div class="rank-num" :style="{ color: index < 3 ? '#00e5ff' : '#888', fontWeight: 'bold' }">{{ index + 1 }}</div>
                <div class="rank-info" style="flex: 1;">
                  <div class="name">{{ rank.name }}</div>
                  <div class="weight" style="font-size: 0.8rem; opacity: 0.6;">累计回收: {{ rank.weight }}kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 管理员视图 -->
    <div v-else>
      <div class="header-section">
        <div class="title-area">
          <h2>⚖️ 社区监管与活动中心</h2>
          <div class="admin-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'moderate' }]" 
              @click="activeTab = 'moderate'"
            >
              <span class="tab-icon">🛡️</span>
              内容审核
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'events' }]" 
              @click="activeTab = 'events'"
            >
              <span class="tab-icon">📅</span>
              活动发布
            </button>
          </div>
        </div>
      </div>

      <!-- 内容审核 -->
      <div v-if="activeTab === 'moderate'" class="admin-content glass-panel">
        <div class="moderate-list">
          <div class="mod-item" v-for="post in logic.feed.value" :key="post.id">
            <div class="mod-header">
              <span class="user">{{ post.user }}</span>
              <span class="time">{{ logic.formatTime(post.createdAt) }}</span>
            </div>
            <p class="content">{{ post.content }}</p>
            <div v-if="post.image" class="feed-image" style="max-width: 400px;">
              <img :src="post.image" @click="logic.openImagePreview(post.image)" />
            </div>
            <div class="mod-footer">
              <button class="btn-sm btn-success">审核通过</button>
              <button class="btn-sm btn-warning" @click="muteUser(post.user)">禁言用户</button>
              <button class="btn-sm btn-danger" @click="logic.deletePost(post.id)">删除违规</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 活动管理 -->
      <div v-else class="admin-content glass-panel">
        <div class="action-bar" style="margin-bottom: 20px; display: flex; justify-content: flex-end; padding: 20px 20px 0;">
          <button class="btn-primary" @click="logic.openActivityModal()" style="padding: 10px 24px;">
            <span style="font-weight: bold; margin-right: 5px;">＋</span> 发布新活动
          </button>
        </div>

        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>活动标题</th>
                <th>地点</th>
                <th>日期</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in logic.tasks.value" :key="task.id">
                <td style="font-weight: 500;">{{ task.title }}</td>
                <td><span style="opacity: 0.7;">📍</span> {{ task.loc }}</td>
                <td>{{ task.date }}</td>
                <td><span class="status-tag success">进行中</span></td>
                <td>
                  <button class="btn-sm btn-info" @click="logic.openActivityModal(task)">编辑</button>
                  <button class="btn-sm btn-warning" @click="logic.cancelActivity(task)" style="margin-left: 5px;">取消</button>
                  <button class="btn-sm btn-danger" @click="logic.deleteActivity(task)" style="margin-left: 5px;">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    <!-- 活动发布弹窗 -->
    <div v-if="logic.showActivityModal.value" class="modal-overlay" @click="logic.closeActivityModal">
      <div class="glass-panel modal-card" @click.stop style="width: 500px; max-width: 90%;">
        <div class="modal-header">
          <h3>{{ logic.editingTaskId.value ? '编辑活动' : '发布新活动' }}</h3>
          <span class="close-btn" @click="logic.closeActivityModal">×</span>
        </div>
        <div class="modal-body form-body">
          <div class="form-group">
            <label>活动标题</label>
            <input v-model="logic.newActivity.value.title" type="text" placeholder="例如：海滩净滩行动" />
          </div>
          <div class="form-group">
            <label>活动地点</label>
            <input v-model="logic.newActivity.value.loc" type="text" placeholder="例如：珍珠湾沙滩" />
          </div>
          <div class="form-group">
            <label>活动日期</label>
            <input v-model="logic.newActivity.value.date" type="date" />
          </div>
          <div class="form-group">
            <label>活动标签</label>
            <select v-model="logic.newActivity.value.tag">
              <option value="组队">组队</option>
              <option value="讲座">讲座</option>
              <option value="义卖">义卖</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="logic.closeActivityModal">取消</button>
          <button class="btn-primary" @click="logic.publishActivity" :disabled="logic.isPublishingActivity.value">
            {{ logic.isPublishingActivity.value ? '保存中...' : (logic.editingTaskId.value ? '确认修改' : '确认发布') }}
          </button>
        </div>
      </div>
    </div>
    </div>

    <!-- 图片预览遮罩 -->
    <div v-if="logic.previewImage.value.show" class="image-preview-overlay" @click="logic.closeImagePreview">
      <div class="preview-container" @click.stop>
        <img :src="logic.previewImage.value.url" />
        <div class="close-preview" @click="logic.closeImagePreview">×</div>
      </div>
    </div>

    <!-- 统一 Toast 提示 -->
    <Transition name="fade">
      <div v-if="logic.toast.value.show" class="toast-message" :class="logic.toast.value.type">
        {{ logic.toast.value.message }}
      </div>
    </Transition>

    <!-- 统一 确认弹窗 -->
    <div v-if="logic.modal.value.show" class="modal-overlay" @click="logic.closeModal">
      <div class="glass-panel modal-card" @click.stop>
        <div class="modal-header">
          <h3>{{ logic.modal.value.title }}</h3>
          <span class="close-btn" @click="logic.closeModal">×</span>
        </div>
        <div class="modal-body">
          <p>{{ logic.modal.value.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="logic.closeModal">取消</button>
          <button class="btn-primary" @click="logic.confirmModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { store } from '../../stores';
import * as logic from './Community.ts';
import './Community.css';

const isAdmin = computed(() => store.isAdmin);
const activeTab = ref('moderate');

onMounted(() => {
  logic.initCommunity();
});

// 管理员特有方法（目前逻辑主要在 .ts 中）
const muteUser = (user: string) => alert(`用户 ${user} 已被禁言 24 小时`);

</script>

<style scoped>
.community-view {
  padding: 10px;
  position: relative;
  min-height: 80vh;
}

.admin-tabs {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #00b4db;
  border-color: #00b4db;
}

/* Toast 样式 */
.toast-message {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 30px;
  border-radius: 30px;
  z-index: 9999;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
  font-weight: bold;
}

.toast-message.success { background: #52c41a; color: white; }
.toast-message.error { background: #ff4d4f; color: white; }
.toast-message.info { background: #1890ff; color: white; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }

.full-width { width: 100%; }
.btn-sm { padding: 5px 15px; font-size: 0.85rem; }

/* 修复 feed-image 在 admin 视图的展示 */
.mod-item .feed-image {
  cursor: default;
}

.btn-more {
  background: none;
  border: none;
  color: #ff4757;
  cursor: pointer;
  font-size: 0.9rem;
}


.btn-more:hover {
  text-decoration: underline;
}

/* 表单样式 */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #cceeff;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #00b4db;
  background: rgba(255, 255, 255, 0.15);
}
</style>
