// src/stores/index.ts
import { reactive } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// 角色映射
const ROLE_MAP: Record<string, string> = {
  'volunteer': '普通志愿者',
  'recycle_admin': '回收站管理员',
  'system_admin': '系统管理员',
  'admin': '管理员'
};

export const store = reactive({
  isLoading: false,
  isLoggedIn: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || '{"name": "User", "role": "volunteer", "points": 0}'),
  
  // 登录动作
  async login(username: string, password: string) {
    this.isLoading = true;
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      const { token, user } = response.data;
      
      this.isLoggedIn = true;
      this.token = token;
      this.user = {
        name: user.username,
        role: ROLE_MAP[user.role] || user.role,
        points: user.points
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
      const response = await axios.post(`${API_URL}/register`, formData);
      return { success: true, message: response.data.message };
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
    this.user = { name: '', role: '', points: 0 };
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 停止加载
  stopLoading() {
    this.isLoading = false;
  }
});