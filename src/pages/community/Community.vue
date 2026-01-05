<template>
  <div class="community-view">
    <div class="header-section">
      <h2>👥 净滩行动广场</h2>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader"></div>
      <p>正在同步海域数据...</p>
    </div>

    <div class="community-layout">
      <!-- Left Column: Tasks -->
      <div class="tasks-column">
        <div class="column-header">
          <h3>🔥 紧急任务</h3>
        </div>

        <div class="task-list">
          <div class="task-card glass-panel" v-for="task in tasks" :key="task.id">
            <div class="task-header">
              <span class="task-tag">组队</span>
              <span class="task-date">{{ task.date }}</span>
            </div>
            <h4>{{ task.title }}</h4>
            <p class="task-loc">📍 {{ task.loc }}</p>
            <div class="task-actions">
              <button 
                v-if="!task.isJoined" 
                class="btn-primary small" 
                @click="joinTask(task)"
              >
                加入队伍
              </button>
              <template v-else>
                <button class="btn-joined small" disabled>已加入</button>
                <button class="btn-outline small" @click="leaveTask(task)">退出队伍</button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Column: Feed -->
      <div class="feed-column">
        <div class="feed-header-area">
          <h3>动态圈</h3>
          <div class="hashtags">
            <span class="tag">#无塑海洋挑战</span>
            <span class="tag">#今日净滩打卡</span>
            <span class="tag">#捡跑行动</span>
          </div>
        </div>

        <!-- Publish Area -->
        <div class="publish-card glass-panel">
          <textarea 
            v-model="newPostContent" 
            placeholder="分享你的净滩故事或环保心得..."
            rows="3"
          ></textarea>
          
          <!-- Image Preview -->
          <div v-if="selectedImage" class="image-preview-container">
            <img :src="selectedImage" alt="Preview" />
            <span class="remove-img" @click="selectedImage = ''">×</span>
          </div>

          <div class="publish-footer">
            <div class="publish-options">
              <label class="opt-icon" title="上传图片">
                📷
                <input type="file" accept="image/*" @change="handleImageSelect" hidden />
              </label>
              <span class="opt-icon" title="所在位置">📍</span>
              <span class="opt-icon" title="添加标签">🏷️</span>
            </div>
            <button 
              class="btn-primary small" 
              @click="publishPost"
              :disabled="(!newPostContent.trim() && !selectedImage) || isPublishing"
            >
              {{ isPublishing ? '发布中...' : '发布动态' }}
            </button>
          </div>
        </div>

        <div class="feed-item glass-panel" v-for="post in feed" :key="post.id">
          <div class="feed-header">
            <div class="user-meta">
              <div class="mini-avatar">👤</div>
              <strong>{{ post.user }}</strong>
            </div>
            <span class="time-ago">{{ formatTime(post.createdAt) }}</span>
          </div>
          <p class="feed-content">{{ post.content }}</p>
          <div v-if="post.image" class="feed-image" @click="openImagePreview(post.image)">
            <img :src="post.image" alt="Post content" />
          </div>
          <div class="feed-actions">
            <span 
              class="action-item" 
              :class="{ 'liked': post.isLiked }"
              @click="toggleLike(post)"
            >
              {{ post.isLiked ? '❤️' : '🤍' }} {{ post.likes }}
            </span>
            <span 
              class="action-item"
              @click="toggleComments(post)"
            >
              💬 {{ post.comments?.length || '' }} 评论
            </span>
            <span 
              v-if="post.user === store.user.name" 
              class="action-item delete-action" 
              @click="deletePost(post.id)"
            >
              🗑️ 删除
            </span>
          </div>

          <!-- Comment Section -->
          <Transition name="fade">
            <div v-if="post.showComments" class="comment-section">
              <div class="comment-list" v-if="post.comments.length > 0">
                <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                  <div class="comment-header">
                    <span class="comment-user">{{ comment.user }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                </div>
              </div>
              <div v-else class="no-comments">暂无评论，快来抢沙发吧~</div>
              
              <div class="comment-input-area">
                <input 
                  type="text" 
                  v-model="post.newCommentContent" 
                  placeholder="写下你的评论..."
                  @keyup.enter="addComment(post)"
                >
                <button 
                  class="btn-primary small" 
                  @click="addComment(post)"
                  :disabled="!post.newCommentContent?.trim()"
                >
                  发表
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Right Column: Leaderboard -->
      <div class="sidebar-column">
        <div class="leaderboard glass-panel">
          <h3>🏆 荣誉榜 (月度)</h3>
          <div class="rank-list">
            <div class="rank-item" v-for="(rank, index) in rankings" :key="index">
              <span class="rank-num" :class="'top-' + (index + 1)">{{ index + 1 }}</span>
              <div class="rank-user">
                <span class="rank-name">{{ rank.name }}</span>
                <span class="rank-weight">{{ rank.weight }} kg</span>
              </div>
              <span v-if="index === 0" class="medal">🥇</span>
              <span v-else-if="index === 1" class="medal">🥈</span>
              <span v-else-if="index === 2" class="medal">🥉</span>
            </div>
          </div>
        </div>

        <div class="mall-promo glass-panel">
          <h4>🎁 装备兑换</h4>
          <p>任务需要手套或清理钳？</p>
          <router-link to="/app/mall" class="promo-link">前往积分商城 &rarr;</router-link>
        </div>
      </div>

    </div>

    <!-- Toast Feedback -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast-message" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Custom Confirm Modal -->
    <Transition name="fade">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card glass-panel shadow-lg">
          <div class="modal-header">
            <h3>{{ modal.title }}</h3>
            <span class="close-btn" @click="closeModal">&times;</span>
          </div>
          <div class="modal-body">
            <p>{{ modal.message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="closeModal">取消</button>
            <button class="btn-primary" @click="confirmModal">确定</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="previewImage.show" class="image-preview-overlay" @click="closeImagePreview">
          <div class="preview-container">
            <img :src="previewImage.url" alt="Preview Large" @click.stop />
            <button class="close-preview" @click="closeImagePreview">&times;</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { store } from '../../stores';
import {
  tasks,
  feed,
  rankings,
  isLoading,
  toast,
  modal,
  newPostContent,
  selectedImage,
  isPublishing,
  previewImage,
  openImagePreview,
  closeImagePreview,
  handleImageSelect,
  formatTime,
  initCommunity,
  joinTask,
  leaveTask,
  publishPost,
  toggleLike,
  toggleComments,
  addComment,
  deletePost,
  closeModal,
  confirmModal
} from './Community';

onMounted(() => {
  initCommunity();
});
</script>

<style scoped src="./Community.css"></style>
