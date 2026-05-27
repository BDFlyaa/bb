import request from '../utils/request';

export interface CommunityTask {
  id: number;
  title: string;
  loc: string;
  date: string;
  tag?: string;
  image?: string;
  isJoined?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityComment {
  id: number;
  user: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: number;
  user: string;
  content: string;
  image?: string;
  likes: number;
  comments?: CommunityComment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityRanking {
  id: number;
  name: string;
  weight: number;
}

export const getTasks = (params?: { username?: string }) => {
  return request.get<any, CommunityTask[]>('/community/tasks', { params });
};

export const getFeed = () => {
  return request.get<any, CommunityPost[]>('/community/feed');
};

export const getRankings = () => {
  return request.get<any, CommunityRanking[]>('/community/rankings');
};

export const joinTask = (taskId: number, body: { username: string }) => {
  return request.post<any, { success: boolean; message: string; task: CommunityTask }>(
    `/community/tasks/${taskId}/join`,
    body
  );
};

export const leaveTask = (taskId: number, body: { username: string }) => {
  return request.post<any, { success: boolean; message: string }>(
    `/community/tasks/${taskId}/leave`,
    body
  );
};

export interface CreatePostBody {
  user?: string;
  content?: string;
  image?: string;
}

export const createPost = (body: CreatePostBody) => {
  return request.post<any, CommunityPost>('/community/feed', body);
};

export interface TaskUpsertBody {
  title: string;
  loc: string;
  date: string;
  tag?: string;
  image?: string;
}

export const createTask = (body: TaskUpsertBody) => {
  return request.post<any, CommunityTask>('/community/tasks', body);
};

export const updateTask = (taskId: number, body: Partial<TaskUpsertBody> & { title?: string }) => {
  return request.put<any, CommunityTask>(`/community/tasks/${taskId}`, body);
};

export const deleteTask = (taskId: number) => {
  return request.delete<any, { success: boolean; message: string }>(`/community/tasks/${taskId}`);
};

export const likePost = (postId: number, username?: string) => {
  return request.post<any, CommunityPost>(`/community/feed/${postId}/like`, { username });
};

export const unlikePost = (postId: number) => {
  return request.post<any, CommunityPost>(`/community/feed/${postId}/unlike`);
};

export const addPostComment = (postId: number, body: { user: string; content: string }) => {
  return request.post<any, CommunityComment>(`/community/feed/${postId}/comments`, body);
};

export const deleteFeedPost = (postId: number, params?: { user?: string; isAdmin?: string | boolean }) => {
  return request.delete<any, { message: string }>(`/community/feed/${postId}`, { params });
};

export const muteUser = (body: { username: string; duration?: string }) => {
  return request.post<any, { success: boolean; message: string; mutedUntil?: string }>('/community/admin/mute-user', body);
};
