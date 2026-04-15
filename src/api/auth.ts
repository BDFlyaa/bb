import request from '../utils/request';

/** 与后端 publicUserPayload 对齐 */
export interface AuthUserPayload {
  id: number;
  username: string;
  nickname?: string | null;
  name: string;
  role: string;
  points: number;
  avatar: string;
  bio: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUserPayload & { userId?: number };
}

export function login(username: string, password: string) {
  return request.post<any, LoginResponse>('/auth/login', { username, password });
}

export interface RegisterBody {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}

export function register(body: RegisterBody) {
  return request.post<any, RegisterResponse>('/auth/register', body);
}

export function getMe() {
  return request.get<any, AuthUserPayload>('/auth/me');
}

export interface UpdateProfileBody {
  nickname: string;
  bio: string;
  avatar: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: AuthUserPayload;
}

export function updateProfile(body: UpdateProfileBody) {
  return request.patch<any, UpdateProfileResponse>('/auth/profile', body);
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export function changePassword(body: ChangePasswordBody) {
  return request.patch<any, { message: string }>('/auth/password', body);
}
