// src/stores/index.ts
import { reactive } from 'vue';
import { getMe, login as authLogin, register as authRegister } from '../api/auth';

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
  }
});