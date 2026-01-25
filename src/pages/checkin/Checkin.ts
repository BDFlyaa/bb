import { ref, computed, onMounted, onUnmounted } from 'vue';
import { store } from '../../stores';
import {
  submitCheckin,
  getCheckinHistory,
  getAuditStats,
  getPendingRecords,
  approveCheckin,
  rejectCheckin,
  getStations,
  generateStationQR,
  classifyRubbish,
  type PendingRecord,
  type Station,
  type RubbishItem
} from '../../api/checkin';

export function useCheckin() {
  const isAdmin = computed(() => store.isAdmin);

  // --- 通用状态 ---
  const currentTime = ref('');
  const timeTimer = ref<any>(null);

  // 更新时间
  const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 问候语
  const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  });

  const loadHistory = async () => {
    try {
      const res = await getCheckinHistory();
      if (res.success) {
        recentHistory.value = res.data.map((item: any) => ({
          id: item.id,
          station: item.station?.name || '未知站点',
          type: item.type,
          points: item.points,
          time: new Date(item.createdAt).toLocaleString(),
          status: item.status === 'approved' ? 'success' : 'pending'
        }));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  onMounted(() => {
    updateTime();
    timeTimer.value = setInterval(updateTime, 1000);
    if (!isAdmin.value) {
      loadHistory();
    } else {
      // 管理员加载审核数据
      loadAuditData();
      loadStations();
    }
  });

  onUnmounted(() => {
    if (timeTimer.value) clearInterval(timeTimer.value);
  });

  // --- Toast 提示 ---
  const toast = ref({
    show: false,
    message: '',
    type: 'success' // success | error | info
  });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    toast.value = { show: true, message: msg, type };
    setTimeout(() => {
      toast.value.show = false;
    }, 3000);
  };

  // --- 志愿者逻辑 ---
  const aiResult = ref(false);
  const isScanning = ref(false);
  const isAnalyzing = ref(false);

  // 垃圾识别结果
  const recognitionResult = ref<{
    category: string;       // 垃圾分类（如：可回收垃圾）
    rubbishName: string;    // 垃圾名称（如：塑料瓶）
    confidence: number;     // 识别置信度
    estimatedWeight: number; // 预估重量 (kg)
    points: number;          // 获得积分
  } | null>(null);
  const uploadedImageUrl = ref('');
  const uploadedFile = ref<File | null>(null);

  // 历史记录
  const recentHistory = ref<any[]>([]);

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      uploadedFile.value = file; // Store the raw File object
      const reader = new FileReader();

      reader.onload = (e) => {
        uploadedImageUrl.value = e.target?.result as string;
        // Start analysis after loading image
        startAiAnalysis();
      };

      reader.readAsDataURL(file);
    }
  };

  const startAiAnalysis = async () => {
    isAnalyzing.value = true;
    recognitionResult.value = null;

    if (!uploadedFile.value) {
      showToast('请先选择图片', 'error');
      isAnalyzing.value = false;
      return;
    }

    try {
      // 调用真实的垃圾识别 API（使用 File 对象）
      const response = await classifyRubbish(uploadedFile.value);

      if (response.success && response.data && response.data.elements.length > 0) {
        const topResult = response.data.elements[0];

        if (!topResult) {
          showToast('识别结果为空，请重新拍照', 'error');
          return;
        }

        // 根据分类计算积分和预估重量
        const pointsMap: Record<string, number> = {
          '可回收垃圾': 25,
          '有害垃圾': 30,
          '厨余垃圾': 15,
          '其他垃圾': 10
        };

        const weightMap: Record<string, number> = {
          '可回收垃圾': 0.45,
          '有害垃圾': 0.2,
          '厨余垃圾': 0.5,
          '其他垃圾': 0.3
        };

        recognitionResult.value = {
          category: topResult.category,
          rubbishName: topResult.rubbish,
          confidence: Math.round(topResult.rubbishScore * 100),
          estimatedWeight: weightMap[topResult.category] || 0.3,
          points: pointsMap[topResult.category] || 15
        };

        aiResult.value = true;
      } else {
        showToast(response.error || '无法识别该物品，请重新拍照', 'error');
      }
    } catch (error) {
      console.error('AI recognition failed:', error);
      showToast('识别服务暂时不可用，请稍后重试', 'error');
    } finally {
      isAnalyzing.value = false;
    }
  };

  const triggerScan = () => {
    isScanning.value = true;
    // 模拟扫码过程，增加一点时间让用户看到扫描动画
    setTimeout(async () => {
      if (isScanning.value) { // 检查是否中途取消
        try {
          // 调用后端接口
          const res = await submitCheckin({
            type: '扫码打卡',
            weight: 0.2, // 模拟重量
            points: 10,
            stationId: '1' // 模拟站点 ID
          });

          isScanning.value = false;

          if (res.success) {
            showToast('扫码成功！已自动签到', 'success');
            // 添加一条记录
            recentHistory.value.unshift({
              id: Date.now(),
              station: '湛山街道回收站',
              type: '扫码打卡',
              points: 10,
              time: '刚刚',
              status: 'success'
            });
            // 更新积分
            if (store.user) {
              store.setPoints(res.points);
            }
          } else {
            showToast('扫码失败: ' + res.message, 'error');
          }
        } catch (error) {
          isScanning.value = false;
          showToast('打卡请求失败，请重试', 'error');
          console.error(error);
        }
      }
    }, 3000);
  };

  const cancelScan = () => {
    isScanning.value = false;
    showToast('已取消扫描', 'info');
  };

  const confirmCheckin = async () => {
    if (!recognitionResult.value) {
      showToast('请先进行垃圾识别', 'error');
      return;
    }

    const { category, rubbishName, estimatedWeight, points } = recognitionResult.value;

    try {
      const res = await submitCheckin({
        type: `AI识别 (${rubbishName})`,
        weight: estimatedWeight,
        points: points,
        imageUrl: uploadedImageUrl.value
      });

      if (res.success) {
        showToast(`打卡确认成功！积分 +${points}`, 'success');
        aiResult.value = false;
        recognitionResult.value = null;
        // 添加记录
        recentHistory.value.unshift({
          id: Date.now(),
          station: '智能识别终端',
          type: `AI识别 (${rubbishName})`,
          points: points,
          time: '刚刚',
          status: 'success'
        });
        // 更新积分
        if (store.user) {
          store.setPoints(res.points);
        }
      } else {
        showToast('打卡失败: ' + res.message, 'error');
      }
    } catch (error) {
      showToast('提交失败，请重试', 'error');
      console.error(error);
    }
  };

  // --- 管理员逻辑 ---
  const activeTab = ref('audit');
  const selectedStation = ref('');
  const qrCodeUrl = ref('');
  const currentQRStationName = ref('');
  const stations = ref<Station[]>([]);
  const isLoadingStations = ref(false);
  const isLoadingAudit = ref(false);

  // 加载站点列表
  const loadStations = async () => {
    isLoadingStations.value = true;
    try {
      const res = await getStations();
      if (res.success && res.data && res.data.length > 0) {
        stations.value = res.data;
        const firstStation = res.data[0];
        if (firstStation) {
          selectedStation.value = firstStation.id.toString();
        }
      }
    } catch (error) {
      console.error('Failed to load stations:', error);
    } finally {
      isLoadingStations.value = false;
    }
  };

  const generateQR = async () => {
    if (!selectedStation.value) {
      showToast('请选择站点', 'error');
      return;
    }
    try {
      const res = await generateStationQR(parseInt(selectedStation.value));
      if (res.success) {
        qrCodeUrl.value = res.data.qrCodeUrl;
        currentQRStationName.value = res.data.stationName;
        showToast('站点二维码已生成', 'success');
      } else {
        showToast('生成二维码失败', 'error');
      }
    } catch (error) {
      showToast('生成二维码失败', 'error');
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl.value) {
      const link = document.createElement('a');
      link.href = qrCodeUrl.value;
      link.download = `PureOcean_${currentQRStationName.value || 'Station'}_QR.png`;
      link.click();
      showToast('海报下载已开始', 'info');
    }
  };

  // 待审核记录
  const pendingRecords = ref<PendingRecord[]>([]);

  // 加载审核数据
  const loadAuditData = async () => {
    isLoadingAudit.value = true;
    try {
      const [statsRes, recordsRes] = await Promise.all([
        getAuditStats(),
        getPendingRecords()
      ]);

      if (statsRes.success) {
        auditStatsData.value = statsRes.data;
      }

      if (recordsRes.success) {
        pendingRecords.value = recordsRes.data;
      }
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      isLoadingAudit.value = false;
    }
  };

  // 审核统计数据
  const auditStatsData = ref({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // 统计数据 (使用真实数据)
  const auditStats = computed(() => auditStatsData.value);

  // 图片预览模态框
  const previewImageState = ref({
    show: false,
    url: ''
  });

  const approve = async (record: any) => {
    try {
      const res = await approveCheckin(record.id);
      if (res.success) {
        showToast(`已通过 ${record.user} 的申请`, 'success');
        // 从列表中移除
        pendingRecords.value = pendingRecords.value.filter(r => r.id !== record.id);
        // 更新统计
        auditStatsData.value.pending = Math.max(0, auditStatsData.value.pending - 1);
        auditStatsData.value.approved += 1;
      } else {
        showToast(res.message || '审核失败', 'error');
      }
    } catch (error) {
      showToast('审核失败，请重试', 'error');
    }
  };

  const reject = async (record: any) => {
    if (confirm(`确定要驳回 ${record.user} 的打卡申请吗？`)) {
      try {
        const res = await rejectCheckin(record.id);
        if (res.success) {
          showToast('申请已驳回', 'info');
          // 从列表中移除
          pendingRecords.value = pendingRecords.value.filter(r => r.id !== record.id);
          // 更新统计
          auditStatsData.value.pending = Math.max(0, auditStatsData.value.pending - 1);
          auditStatsData.value.rejected += 1;
        } else {
          showToast(res.message || '驳回失败', 'error');
        }
      } catch (error) {
        showToast('驳回失败，请重试', 'error');
      }
    }
  };

  const previewImg = (url: string) => {
    previewImageState.value = { show: true, url };
  };

  const closePreview = () => {
    previewImageState.value.show = false;
  };

  return {
    isAdmin,
    // 通用
    currentTime,
    greeting,
    toast,
    // 志愿者
    aiResult,
    isScanning,
    isAnalyzing,
    recentHistory,
    handleFileChange,
    uploadedImageUrl,
    triggerScan,
    cancelScan,
    confirmCheckin,
    recognitionResult,
    // 管理员
    activeTab,
    selectedStation,
    qrCodeUrl,
    currentQRStationName,
    stations,
    generateQR,
    downloadQR,
    pendingRecords,
    auditStats,
    previewImageState,
    approve,
    reject,
    previewImg,
    closePreview,
    isLoadingAudit,
    loadAuditData
  };
}
