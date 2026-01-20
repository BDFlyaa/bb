import { ref, computed, onMounted, onUnmounted } from 'vue';
import { store } from '../../stores';
import img1 from '../../assets/images/1.jpg';
import img2 from '../../assets/images/2.jpg';

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

  onMounted(() => {
    updateTime();
    timeTimer.value = setInterval(updateTime, 1000);
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
  const uploadedImageUrl = ref('');

  // 模拟志愿者历史记录
  const recentHistory = ref([
    { id: 101, station: '五四广场回收点', type: '扫码打卡', points: 10, time: '今日 10:23', status: 'success' },
    { id: 102, station: '八大关环保站', type: 'AI识别 (PET瓶)', points: 25, time: '昨日 15:40', status: 'success' },
  ]);

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        uploadedImageUrl.value = e.target?.result as string;
        // Start analysis after loading image
        startAiAnalysis();
      };
      
      reader.readAsDataURL(file);
    }
  };

  const startAiAnalysis = () => {
    isAnalyzing.value = true;
    // 模拟 AI 识别延迟
    setTimeout(() => {
      isAnalyzing.value = false;
      aiResult.value = true;
    }, 2000);
  };

  const triggerScan = () => {
    isScanning.value = true;
    // 模拟扫码过程，增加一点时间让用户看到扫描动画
    setTimeout(() => {
      if (isScanning.value) { // 检查是否中途取消
        isScanning.value = false;
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
        // 增加积分
        store.user.points += 10;
      }
    }, 3000);
  };

  const cancelScan = () => {
    isScanning.value = false;
    showToast('已取消扫描', 'info');
  };

  const confirmCheckin = () => {
    showToast('打卡确认成功！积分 +25', 'success');
    aiResult.value = false;
    // 添加记录
    recentHistory.value.unshift({
      id: Date.now(),
      station: '智能识别终端',
      type: 'AI识别 (PET瓶)',
      points: 25,
      time: '刚刚',
      status: 'success'
    });
    store.user.points += 25;
  };

  // --- 管理员逻辑 ---
  const activeTab = ref('audit');
  const selectedStation = ref('1');
  const qrCodeUrl = ref('');

  const generateQR = () => {
    qrCodeUrl.value = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PureOcean_Station_001';
    showToast('站点二维码已生成', 'success');
  };

  const downloadQR = () => {
    showToast('海报下载任务已开始', 'info');
  };

  // 模拟审核数据
  const mockRecords = ref([
    { id: 1, user: '王小明', img: img1, aiResult: 'PET瓶 0.5kg', time: '10-26 14:20' },
    { id: 2, user: '陈美美', img: img2, aiResult: '混合塑料 1.2kg', time: '10-26 15:10' },
    { id: 3, user: '李强', img: img1, aiResult: '易拉罐 0.3kg', time: '10-26 16:05' },
    { id: 4, user: '张伟', img: img2, aiResult: '纸板 2.1kg', time: '10-26 16:45' }
  ]);

  // 统计数据
  const auditStats = computed(() => {
    return {
      pending: mockRecords.value.length,
      approved: 128, // 模拟数据
      rejected: 12   // 模拟数据
    };
  });

  // 图片预览模态框
  const previewImageState = ref({
    show: false,
    url: ''
  });

  const approve = (record: any) => {
    showToast(`已通过 ${record.user} 的申请`, 'success');
    // 增加延迟模拟网络请求
    setTimeout(() => {
      mockRecords.value = mockRecords.value.filter(r => r.id !== record.id);
    }, 300);
  };

  const reject = (record: any) => {
    if (confirm(`确定要驳回 ${record.user} 的打卡申请吗？`)) {
      showToast('申请已驳回', 'info');
      // 增加延迟模拟网络请求
      setTimeout(() => {
        mockRecords.value = mockRecords.value.filter(r => r.id !== record.id);
      }, 300);
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
    // 管理员
    activeTab,
    selectedStation,
    qrCodeUrl,
    generateQR,
    downloadQR,
    mockRecords,
    auditStats,
    previewImageState,
    approve,
    reject,
    previewImg,
    closePreview
  };
}
