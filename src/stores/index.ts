// src/stores/index.ts
import { reactive } from 'vue';
import { getMe, login as authLogin, register as authRegister } from '../api/auth';
import {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type NotificationItem,
} from '../api/notification';

// 角色映射
const ROLE_MAP: Record<string, string> = {
  'volunteer': '普通志愿者',
  'system_admin': '系统管理员',
  'admin': '管理员'
};

export const store = reactive({
  isLoading: false,
  isLoggedIn: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || '{"id": 0, "name": "User", "role": "volunteer", "points": 0, "avatar": "", "bio": ""}'),

  // ===== 通知系统 =====
  unreadCount: 0,
  notifications: [] as NotificationItem[],
  notificationPanelVisible: false,
  notificationLoading: false,
  notificationEnabled: localStorage.getItem('notificationEnabled') !== 'false', // 默认开启

  // ===== 全局 Toast =====
  toasts: [] as { id: number; type: 'success' | 'error' | 'info'; message: string }[],

  // 是否为管理员
  get isAdmin() {
    const r = this.user.role;
    return ['admin', 'system_admin'].includes(r);
  },

  // 获取显示的中文角色名
  get userDisplayRole() {
    return ROLE_MAP[this.user.role] || this.user.role;
  },

  // 登录动作
  async login(username: string, password: string) {
    this.isLoading = true;
    try {
      const { token, user } = await authLogin(username, password);

      this.isLoggedIn = true;
      this.token = token;
      this.user = {
        id: user.userId || user.id,
        username: user.username,
        name: user.name || user.nickname || user.username,
        role: user.role,
        points: user.points ?? 0,
        avatar: user.avatar || '',
        bio: user.bio || ''
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(this.user));
      return { success: true };
    } catch (error: any) {
      console.error('登录失败:', error);
      return {
        success: false,
        message: error.response?.data?.message || '登录失败，请检查网络或用户名密码'
      };
    } finally {
      this.isLoading = false;
    }
  },

  // 注册动作
  async register(formData: any) {
    this.isLoading = true;
    try {
      const data = await authRegister(formData);
      return { success: true, message: data.message };
    } catch (error: any) {
      console.error('注册失败:', error);
      return {
        success: false,
        message: error.response?.data?.message || '注册失败，请稍后重试'
      };
    } finally {
      this.isLoading = false;
    }
  },

  // 退出
  logout() {
    this.isLoggedIn = false;
    this.token = '';
    this.user = { id: 0, username: '', name: '', role: '', points: 0, avatar: '', bio: '' };
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 更新个人资料
  updateProfile(profile: { name?: string; avatar?: string; bio?: string }) {
    if (this.user) {
      this.user = { ...this.user, ...profile };
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  },

  // 更新积分（正数为增加，负数为扣除）
  updatePoints(amount: number) {
    if (this.user) {
      this.user.points = (this.user.points || 0) + amount;
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  },

  // 设置积分（绝对值）
  setPoints(points: number) {
    if (this.user) {
      this.user.points = points;
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  },

  // 从服务器同步最新的用户信息
  async fetchUserProfile() {
    if (!this.isLoggedIn) return;

    try {
      const userData = await getMe();

      this.user = {
        id: userData.id,
        username: userData.username,
        name: userData.name || userData.nickname || userData.username,
        role: userData.role,
        points: userData.points ?? 0,
        avatar: userData.avatar || '',
        bio: userData.bio || ''
      };

      localStorage.setItem('user', JSON.stringify(this.user));
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  // 停止加载
  stopLoading() {
    this.isLoading = false;
  },

  // ===== 通知方法 =====

  // 获取未读通知数量（轮询用）
  async fetchUnreadCount() {
    if (!this.isLoggedIn) return;
    try {
      const res = await getUnreadCount();
      if (res.success) {
        this.unreadCount = res.data.count;
      }
    } catch (e) {
      // 静默失败，不打断用户
    }
  },

  // 加载通知列表
  async fetchNotifications(page = 1) {
    this.notificationLoading = true;
    try {
      const res = await getNotifications({ page, pageSize: 20 });
      if (res.success) {
        this.notifications = res.data.list;
      }
    } catch (e) {
      console.error('获取通知列表失败:', e);
    } finally {
      this.notificationLoading = false;
    }
  },

  // 标记单条已读
  async markNotificationRead(id: number) {
    try {
      await markAsRead(id);
      const item = this.notifications.find(n => n.id === id);
      if (item && !item.isRead) {
        item.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    } catch (e) {
      console.error('标记已读失败:', e);
    }
  },

  // 全部标记已读
  async markAllNotificationsRead() {
    try {
      await markAllAsRead();
      this.notifications.forEach(n => { n.isRead = true; });
      this.unreadCount = 0;
    } catch (e) {
      console.error('全部标记已读失败:', e);
    }
  },

  // 删除通知
  async removeNotification(id: number) {
    const item = this.notifications.find(n => n.id === id);
    try {
      await deleteNotification(id);
      this.notifications = this.notifications.filter(n => n.id !== id);
      if (item && !item.isRead) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    } catch (e) {
      console.error('删除通知失败:', e);
    }
  },

  // 开关通知面板
  toggleNotificationPanel() {
    this.notificationPanelVisible = !this.notificationPanelVisible;
    if (this.notificationPanelVisible) {
      this.fetchNotifications();
    }
  },

  // ===== 全局 Toast =====
  showToast(type: 'success' | 'error' | 'info', message: string) {
    const id = Date.now();
    this.toasts.push({ id, type, message });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  },
});