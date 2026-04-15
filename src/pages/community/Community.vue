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
            <h3>活跃任务</h3>
            <a href="#" class="view-all">查看全部</a>
          </div>
          <div class="task-list task-list-scroll">
            <div v-for="task in logic.tasks.value" :key="task.id" class="glass-panel task-card">
              <div class="task-image-placeholder">
                <img :src="task.image || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=500&auto=format&fit=crop&q=60'" alt="Task Cover">
                <span class="task-level-badge">初级</span>
              </div>
              <div class="task-content">
                <h4>{{ task.title }}</h4>
                <div class="task-meta">
                  <span class="task-date">{{ task.date }}</span>
                  <span class="task-loc">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> 
                    {{ task.loc }}
                  </span>
                </div>
                <button v-if="!task.isJoined" @click="logic.joinTask(task)" class="btn-primary full-width">报名参加</button>
                <button v-else @click="logic.leaveTask(task)" class="btn-ghost full-width">已参加 (退出)</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：动态流 -->
        <div class="feed-column">
          <!-- 发布卡片 -->
          <div class="glass-panel publish-card">
            <div class="publish-input-area">
              <div class="user-avatar-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <textarea 
                v-model="logic.newPostContent.value" 
                placeholder="分享你的最新环保成就..."
                :disabled="logic.isPublishing.value"
              ></textarea>
            </div>
            
            <div v-if="logic.selectedImage.value" class="image-preview-container">
              <img :src="logic.selectedImage.value" />
              <span class="remove-img" @click="logic.selectedImage.value = ''">×</span>
            </div>

            <div class="publish-footer">
              <div class="publish-options">
                <label class="opt-btn" title="上传图片">
                  <input type="file" hidden @change="logic.handleImageSelect" accept="image/*" />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>照片</span>
                </label>
                <button class="opt-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  <span>视频</span>
                </button>
                <button class="opt-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>位置</span>
                </button>
              </div>
              <button 
                class="btn-primary" 
                @click="logic.publishPost" 
                :disabled="logic.isPublishing.value || (!logic.newPostContent.value.trim() && !logic.selectedImage.value)"
              >
                {{ logic.isPublishing.value ? '发布中...' : '发布' }}
              </button>
            </div>
          </div>

          <!-- 动态列表：可视区约五条高度，向下滚动查看更早动态 -->
          <div class="feed-list feed-list-scroll">
            <div v-for="post in logic.feed.value" :key="post.id" class="glass-panel feed-item">
              <div class="feed-header">
                <div class="user-info">
                  <div class="avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div class="meta">
                    <div class="username">{{ post.user }}</div>
                    <div class="sub-meta">
                      <span class="time-ago">{{ logic.formatTime(post.createdAt) }}</span>
                      <span class="location-tag" v-if="post.user === 'Sarah Jenkins'">• Santa Monica, CA</span>
                    </div>
                  </div>
                </div>
                <button v-if="post.user === store.user.name" class="btn-more" @click="logic.deletePost(post.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
              </div>

              <div class="feed-content">{{ post.content }}</div>
              
              <div v-if="post.image" class="feed-image-container">
                <img :src="post.image" loading="lazy" @click="logic.openImagePreview(post.image)" />
              </div>

              <div class="feed-actions">
                <div class="action-item" :class="{ liked: post.isLiked }" @click="logic.toggleLike(post)">
                  <span class="icon">
                    <svg v-if="post.isLiked" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </span>
                  <span class="count">{{ post.likes }}</span>
                </div>
                <div class="action-item" @click="logic.toggleComments(post)">
                  <span class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </span>
                  <span class="count">{{ post.comments?.length || 0 }}</span>
                </div>
                <div class="action-item">
                  <span class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  </span>
                </div>
              </div>

              <!-- 评论区 -->
              <div v-if="post.showComments" class="comment-section">
                <div class="comment-list">
                  <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                    <span class="comment-user">{{ comment.user }}</span>:
                    <span class="comment-content">{{ comment.content }}</span>
                  </div>
                </div>
                
                <div class="comment-input-area">
                  <input 
                    v-model="post.newCommentContent" 
                    type="text" 
                    placeholder="写下你的评论..." 
                    @keyup.enter="logic.addComment(post)"
                  />
                  <button class="btn-text" @click="logic.addComment(post)">发送</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：排行榜 -->
        <div class="rank-column">
          <div class="glass-panel sidebar-card rank-card">
            <div class="card-header">
              <h3>回收达人榜</h3>
              <div class="rank-tabs">
                <span class="active">周榜</span>
                <span>总榜</span>
              </div>
            </div>
            
            <div class="rank-list">
              <div v-for="(rank, index) in logic.rankings.value" :key="rank.id" class="rank-item">
                <div class="rank-num" :class="`top-${index + 1}`">{{ index + 1 }}</div>
                <div class="rank-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="rank-info">
                  <div class="name">{{ rank.name }}</div>
                  <div class="role">志愿者</div>
                </div>
                <div class="rank-score">{{ rank.weight }}kg</div>
              </div>
            </div>
            
            <div class="rank-footer">
              <a href="#">查看完整排行榜</a>
            </div>
          </div>

          <!-- 捐赠卡片 -->
          <div class="glass-panel sidebar-card donate-card">
            <h3>捐助海洋清理行动</h3>
            <p>支持我们部署先进机械设备，清理太平洋垃圾带。</p>
            <button class="btn-white full-width">立即捐赠</button>
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
            <div v-if="post.image" class="feed-image-container">
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
                <td><span style="opacity: 0.7; display: inline-flex; vertical-align: middle; margin-right: 4px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>{{ task.loc }}</td>
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
            <input v-model="logic.newActivity.value.date" type="text" placeholder="例如：下周五 08:30" />
          </div>
          <div class="form-group">
            <label>封面图片 URL</label>
            <input v-model="logic.newActivity.value.image" type="text" placeholder="https://images.unsplash.com/..." />
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

/* Toast styles removed */
/* Full width and btn-sm removed */
/* Feed image fix preserved - removed as now using global container */

/* btn-more removed (global) */

/* 表单样式 */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

/* form-group styles removed (global) */
</style>
