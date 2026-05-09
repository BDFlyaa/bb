<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="store.notificationPanelVisible" class="panel-overlay" @click.self="store.notificationPanelVisible = false">
        <div class="notification-panel glass-panel">
          <!-- 头部 -->
          <div class="panel-header">
            <h3>通知中心</h3>
            <div class="header-actions">
              <button v-if="store.unreadCount > 0" class="action-btn" @click="store.markAllNotificationsRead()">
                全部已读
              </button>
              <button class="close-btn" @click="store.notificationPanelVisible = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- 列表 -->
          <div class="notification-list">
            <div v-if="store.notificationLoading" class="list-state">加载中...</div>
            <div v-else-if="store.notifications.length === 0" class="list-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>暂无通知</span>
            </div>

            <div
              v-for="item in store.notifications"
              :key="item.id"
              class="notification-item"
              :class="{ unread: !item.isRead }"
              @click="handleItemClick(item)"
            >
              <div class="item-icon">
                <svg v-if="item.type === 'checkin_approved'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <svg v-else-if="item.type === 'checkin_rejected'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <svg v-else-if="item.type === 'order_shipped'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b4db" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <svg v-else-if="item.type === 'order_cancelled'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffaa00" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                <svg v-else-if="item.type === 'community_like'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff79c6" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                <svg v-else-if="item.type === 'community_comment'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <div class="item-content">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-body">{{ item.content }}</div>
                <div class="item-time">{{ formatTime(item.createdAt) }}</div>
              </div>
              <button class="item-delete" @click.stop="store.removeNotification(item.id)" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
              <div v-if="!item.isRead" class="unread-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { store } from '../../stores';
import type { NotificationItem } from '../../api/notification';

function formatTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return dateStr.slice(0, 10);
}

function handleItemClick(item: NotificationItem) {
  if (!item.isRead) {
    store.markNotificationRead(item.id);
  }
  // 暂不做跳转（相关页面无独立路由锚点）
}
</script>

<style scoped>
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 5000;
  display: flex;
  justify-content: flex-end;
}

.notification-panel {
  width: 380px;
  max-width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 16px 0 0 16px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.close-btn:hover { color: #fff; }

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.4);
  gap: 12px;
  font-size: 0.9rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}
.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
.notification-item.unread {
  background: rgba(0, 180, 219, 0.06);
}

.item-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.item-content { flex: 1; min-width: 0; }

.item-title {
  font-size: 0.9rem;
  color: #fff;
  margin-bottom: 4px;
  font-weight: 500;
}

.item-body {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.item-time {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
}

.item-delete {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: all 0.2s;
  margin-top: 2px;
}
.notification-item:hover .item-delete { opacity: 1; }
.item-delete:hover { color: #ff6b6b; }

.unread-dot {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00b4db;
}

/* 面板滑入动画 */
.panel-enter-active { animation: slide-in 0.25s ease-out; }
.panel-leave-active { animation: slide-in 0.2s ease-in reverse; }
.panel-enter-active .notification-panel { animation: slide-in 0.25s ease-out; }
.panel-leave-active .notification-panel { animation: slide-in 0.2s ease-in reverse; }

@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@media (max-width: 480px) {
  .notification-panel {
    width: 100vw;
    border-radius: 0;
  }
}
</style>
