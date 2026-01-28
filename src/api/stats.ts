import request from '../utils/request';

export interface OverviewData {
  totalWeight: string;
  todayWeight: string;
  carbonReduction: string;
}

export interface Activity {
  id: number;
  time: string;
  user: string;
  weight: number;
  type: string;
}

export interface Ranking {
  name: string;
  score: number;
}

export interface TrendData {
  days: string[];
  weights: number[];
}

export interface InventoryData {
  items: {
    name: string;
    percentage: number;
    warning: boolean;
  }[];
}

export interface TaskStatus {
  id: number;
  text: string;
  reward: string;
  done: boolean;
}

export interface UserStats {
  username: string;
  totalWeight: string;
  points: number;
  checkinCount: number;
  savedAnimals: number;
  level: number;
  levelProgress: number;
  pointsToNextLevel: number;
  tasks: TaskStatus[];
}

export const getOverview = () => {
  return request.get<any, OverviewData>('/stats/overview');
};

export const getRecentActivities = () => {
  return request.get<any, Activity[]>('/stats/recent-activities');
};

export const getRankings = () => {
  return request.get<any, Ranking[]>('/stats/rankings');
};

export const getWeeklyTrend = () => {
  return request.get<any, TrendData>('/stats/weekly-trend');
};

export const getInventory = () => {
  return request.get<any, InventoryData>('/stats/inventory');
};

export const getUserStats = (userId: number) => {
  return request.get<any, UserStats>(`/stats/user/${userId}`);
};

export const completeTask = (userId: number, taskId: number) => {
  return request.post<any, { success: boolean; message: string; newPoints: number }>('/stats/complete-task', { userId, taskId });
};
