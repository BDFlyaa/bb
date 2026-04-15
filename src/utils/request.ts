import axios, { type AxiosError } from 'axios';

/** 默认 `/api`，开发时由 Vite 代理到后端；生产可设 `VITE_API_BASE_URL` 指向完整网关地址 */
function resolveBaseURL(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) return '/api';
  return raw.replace(/\/+$/, '');
}

const service = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      const onAuthPage = path === '/login' || path === '/register';
      if (hadToken && !onAuthPage) {
        window.location.assign('/login');
      }
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default service;
