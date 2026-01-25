import request from '../utils/request';

export interface CheckinData {
  type: string;
  weight: number;
  points: number;
  imageUrl?: string;
  stationId?: string;
}

export interface CheckinResponse {
  success: boolean;
  message: string;
  points: number;
  record: any;
}

export interface CheckinStats {
  success: boolean;
  count: number;
  totalPoints: number;
}

export interface CheckinHistoryItem {
  id: number;
  station?: { name: string };
  type: string;
  points: number;
  createdAt: string;
  status: string;
}

export interface CheckinHistoryResponse {
  success: boolean;
  data: CheckinHistoryItem[];
}

export const submitCheckin = async (data: CheckinData): Promise<CheckinResponse> => {
  try {
    return await request.post<any, CheckinResponse>('/checkin', data);
  } catch (error) {
    console.warn('Checkin API failed, using mock data:', error);
    // 模拟成功响应，解决无后端环境下的演示问题
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '打卡成功',
          points: data.points,
          record: {
            id: Date.now(),
            ...data,
            time: new Date().toLocaleString()
          }
        });
      }, 800);
    });
  }
};

export const getCheckinStats = async (): Promise<CheckinStats> => {
  try {
    return await request.get<any, CheckinStats>('/checkin/stats');
  } catch (error) {
    console.warn('Get checkin stats failed, using mock data');
    return { success: true, count: 0, totalPoints: 0 };
  }
};

export const getCheckinHistory = async (limit = 20): Promise<CheckinHistoryResponse> => {
  try {
    return await request.get<any, CheckinHistoryResponse>('/checkin/history', { params: { limit } });
  } catch (error) {
    console.warn('Get checkin history failed, using mock data');
    return { success: true, data: [] };
  }
};

// ==================== 管理员 API ====================

export interface AuditStats {
  pending: number;
  approved: number;
  rejected: number;
}

export interface AuditStatsResponse {
  success: boolean;
  data: AuditStats;
}

export interface PendingRecord {
  id: number;
  user: string;
  userId: number;
  img: string;
  aiResult: string;
  time: string;
  points: number;
  stationName: string;
}

export interface PendingRecordsResponse {
  success: boolean;
  data: PendingRecord[];
}

export interface Station {
  id: number;
  name: string;
  address: string;
  status: string;
}

export interface StationsResponse {
  success: boolean;
  data: Station[];
}

export interface QRCodeResponse {
  success: boolean;
  data: {
    qrCodeUrl: string;
    stationName: string;
    stationId: number;
  };
}

// 获取审核统计数据
export const getAuditStats = async (): Promise<AuditStatsResponse> => {
  try {
    return await request.get<any, AuditStatsResponse>('/checkin/admin/audit-stats');
  } catch (error) {
    console.warn('Get audit stats failed, using mock data');
    return { success: true, data: { pending: 0, approved: 0, rejected: 0 } };
  }
};

// 获取待审核记录列表
export const getPendingRecords = async (limit = 50, offset = 0): Promise<PendingRecordsResponse> => {
  try {
    return await request.get<any, PendingRecordsResponse>('/checkin/admin/pending', {
      params: { limit, offset }
    });
  } catch (error) {
    console.warn('Get pending records failed, using mock data');
    return { success: true, data: [] };
  }
};

// 通过审核
export const approveCheckin = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    return await request.post<any, { success: boolean; message: string }>(`/checkin/admin/approve/${id}`);
  } catch (error) {
    console.warn('Approve checkin failed');
    return { success: false, message: '审核失败' };
  }
};

// 驳回审核
export const rejectCheckin = async (id: number, reason?: string): Promise<{ success: boolean; message: string }> => {
  try {
    return await request.post<any, { success: boolean; message: string }>(`/checkin/admin/reject/${id}`, { reason });
  } catch (error) {
    console.warn('Reject checkin failed');
    return { success: false, message: '驳回失败' };
  }
};

// 获取站点列表
export const getStations = async (): Promise<StationsResponse> => {
  try {
    return await request.get<any, StationsResponse>('/checkin/admin/stations');
  } catch (error) {
    console.warn('Get stations failed, using mock data');
    return { success: true, data: [] };
  }
};

// 生成站点二维码
export const generateStationQR = async (stationId: number): Promise<QRCodeResponse> => {
  try {
    return await request.post<any, QRCodeResponse>('/checkin/admin/generate-qr', { stationId });
  } catch (error) {
    console.warn('Generate QR failed');
    return {
      success: false,
      data: { qrCodeUrl: '', stationName: '', stationId: 0 }
    };
  }
};

// 提交待审核的打卡记录
export const submitForReview = async (data: CheckinData): Promise<CheckinResponse> => {
  try {
    return await request.post<any, CheckinResponse>('/checkin/submit-for-review', data);
  } catch (error) {
    console.warn('Submit for review failed');
    return { success: false, message: '提交审核失败', points: 0, record: null };
  }
};
