import { ref, computed, onMounted, onUnmounted } from 'vue';
import { store } from '../../stores';
import {
  submitCheckin,
  getCheckinHistory,
  getAuditStats,
  getAuditRecords,
  approveCheckin,
  rejectCheckin,
  getStations,
  generateStationQR,
  exportAuditCSV,
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
          station: item.station?.name || '非官方点位 (个人清理)',
          type: item.type,
          points: item.points,
          time: new Date(item.createdAt).toLocaleString(),
          status: item.status === 'approved' ? 'success' : 'pending',
          batchNo: item.batchNo || null // 添加批次号
        }));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  onMounted(() => {
    updateTime();
    timeTimer.value = setInterval(updateTime, 1000);
    
    // 无论是管理员还是志愿者，都加载站点列表（志愿者用于 AI 识图选择站点）
    loadStations();

    if (!isAdmin.value) {
      loadHistory();
    } else {
      // 管理员加载审核数据
      loadAuditData();
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
    count: number;           // 物品数量
    originalRubbishName: string; // 原始垃圾名称（不含数量后缀）
  } | null>(null);

  // AI 识图选择的站点
  const selectedAiStation = ref<string>('');

  const adjustCount = (delta: number) => {
    if (!recognitionResult.value) return;
    
    const newCount = Math.max(1, recognitionResult.value.count + delta);
    if (newCount === recognitionResult.value.count) return;

    const category = recognitionResult.value.category;
    const objectCount = newCount;
    const rubbishName = recognitionResult.value.originalRubbishName;

    // 重新计算重量和积分
    const singleWeightMap: Record<string, number> = {
      '可回收垃圾': 0.05,
      '有害垃圾': 0.1,
      '厨余垃圾': 0.2,
      '其他垃圾': 0.1
    };

    const basePointsMap: Record<string, number> = {
      '可回收垃圾': 5,
      '有害垃圾': 10,
      '厨余垃圾': 2,
      '其他垃圾': 1
    };

    const singleWeight = singleWeightMap[category] || 0.1;
    const calculatedWeight = parseFloat((objectCount * singleWeight).toFixed(2));
    const calculatedPoints = Math.max(10, objectCount * (basePointsMap[category] || 5));

    recognitionResult.value = {
      ...recognitionResult.value,
      count: objectCount,
      rubbishName: `${rubbishName}${objectCount > 1 ? ` x${objectCount}` : ''}`,
      estimatedWeight: calculatedWeight,
      points: calculatedPoints
    };
  };
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

        const category = topResult.Category || topResult.category || '其他垃圾';
        const rubbishName = topResult.Rubbish || topResult.rubbish || '未知物品';
        const rubbishScore = topResult.RubbishScore || topResult.rubbishScore || 0;
        
        // 获取 AI 识别到的物体数量
        const objectCount = response.data.objectCount || 1;

        // 根据分类设定单重基准 (kg/个)
        const singleWeightMap: Record<string, number> = {
          '可回收垃圾': 0.05, // 例如一个瓶子 50g
          '有害垃圾': 0.1,
          '厨余垃圾': 0.2,
          '其他垃圾': 0.1
        };

        const basePointsMap: Record<string, number> = {
          '可回收垃圾': 5,
          '有害垃圾': 10,
          '厨余垃圾': 2,
          '其他垃圾': 1
        };

        const singleWeight = singleWeightMap[category] || 0.1;
        const calculatedWeight = parseFloat((objectCount * singleWeight).toFixed(2));
        const calculatedPoints = Math.max(10, objectCount * (basePointsMap[category] || 5));

        recognitionResult.value = {
          category,
          rubbishName: `${rubbishName}${objectCount > 1 ? ` x${objectCount}` : ''}`,
          originalRubbishName: rubbishName,
          count: objectCount,
          confidence: Math.round(rubbishScore * 100),
          estimatedWeight: calculatedWeight,
          points: calculatedPoints
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
              points: res.points || 10,
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

    if (!selectedAiStation.value) {
      showToast('请选择投放站点', 'error');
      return;
    }

    const { category, rubbishName, estimatedWeight, points, confidence } = recognitionResult.value;

    // 解析站点名称，用于前端显示和传递给后端存入溯源记录
    let stationName = '非官方点位 (个人清理)';
    if (selectedAiStation.value !== 'other') {
      stationName = stations.value.find(s => s.id.toString() === selectedAiStation.value)?.name || '非官方点位 (个人清理)';
    }

    try {
      const res = await submitCheckin({
        type: `AI识别 (${rubbishName})`,
        weight: estimatedWeight,
        points: points,
        imageUrl: uploadedImageUrl.value,
        confidence: confidence, // 传递置信度给后端
        stationId: selectedAiStation.value === 'other' ? null : selectedAiStation.value, // 传递站点 ID
        stationName // 传递站点名称，供后端写入溢源记录
      });

      if (res.success) {
        // 根据返回状态显示不同提示
        if (res.status === 'approved') {
          showToast(`打卡成功！积分 +${points}`, 'success');
          // 更新积分
          if (store.user) {
            store.setPoints(res.points);
          }
        } else if (res.status === 'pending') {
          showToast('已提交审核，通过后将获得积分', 'info');
        }

        aiResult.value = false;
        recognitionResult.value = null;
        selectedAiStation.value = ''; // 重置选择

        // 添加记录
        recentHistory.value.unshift({
          id: Date.now(),
          station: stationName,
          type: `AI识别 (${rubbishName})`,
          points: res.status === 'approved' ? points : 0,
          time: '刚刚',
          status: res.status === 'approved' ? 'success' : 'pending',
          batchNo: res.record?.batchNo || null
        });
      } else {
        // 处理被拒绝的情况（置信度过低）
        if (res.status === 'rejected') {
          showToast(res.message || '识别置信度过低，请重新拍照', 'error');
        } else {
          showToast('打卡失败: ' + res.message, 'error');
        }
      }
    } catch (error: any) {
      // 处理 400 错误（被拒绝）
      if (error.response?.data?.status === 'rejected') {
        showToast(error.response.data.message || '识别置信度过低，请重新拍照', 'error');
      } else {
        showToast('提交失败，请重试', 'error');
      }
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
      const res = await getStations(isAdmin.value);
      if (res.success && res.data && res.data.length > 0) {
        stations.value = res.data;
        
        // 如果只有一个站点，且是志愿者模式，默认选择该站点（用于 AI 识图）
        if (res.data.length === 1 && !isAdmin.value) {
          selectedAiStation.value = res.data[0].id.toString();
        }
        
        // 管理员模式下的默认选择
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

  const exportCSV = async () => {
    try {
      showToast('正在准备导出数据...', 'info');
      // 模拟一个导出过程
      setTimeout(() => {
        const csvContent = "data:text/csv;charset=utf-8,志愿者,识别结果,提交时间,状态\n" +
          auditRecords.value.map(r => `${r.user},${r.aiResult},${r.time},${r.status}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `打卡记录_${auditFilter.value}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('导出成功', 'success');
      }, 1000);
    } catch (error) {
      showToast('导出失败', 'error');
    }
  };

  // 审核筛选状态
  const auditFilter = ref<'pending' | 'approved' | 'rejected'>('pending');

  // 审核记录（根据筛选状态动态命名）
  const auditRecords = ref<PendingRecord[]>([]);

  // 标题映射
  const sectionTitle = computed(() => {
    const titles: Record<string, string> = {
      pending: '待处理申请',
      approved: '已通过申请',
      rejected: '已驳回申请'
    };
    return titles[auditFilter.value] || '待处理申请';
  });

  // 格式化图片 URL
  const formatImageUrl = (url: string) => {
    if (!url) return '';
    let formattedUrl = url.replace(/\\/g, '/'); // 统一将反斜杠替换为正斜杠
    // 如果后端返回的是完整 URL 且包含 localhost，替换为当前访问的 host (针对移动端调试)
    if (formattedUrl.startsWith('http://localhost') || formattedUrl.startsWith('http://127.0.0.1')) {
      formattedUrl = formattedUrl.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, window.location.origin);
    }
    // 如果是相对路径 (例如 /uploads/...)
    else if (!formattedUrl.startsWith('http') && !formattedUrl.startsWith('data:')) {
      // 统一补全 /api 前缀，让 Vite 代理处理
      const prefix = '/api';
      formattedUrl = `${prefix}${formattedUrl.startsWith('/') ? '' : '/'}${formattedUrl}`;
    }
    return formattedUrl;
  };

  // 加载审核数据
  const loadAuditData = async (status?: 'pending' | 'approved' | 'rejected') => {
    isLoadingAudit.value = true;
    const filterStatus = status || auditFilter.value;

    try {
      const [statsRes, recordsRes] = await Promise.all([
        getAuditStats(),
        getAuditRecords(filterStatus)
      ]);

      if (statsRes.success) {
        auditStatsData.value = statsRes.data;
      }

      if (recordsRes.success) {
        // 格式化记录中的图片 URL
        auditRecords.value = recordsRes.data.map((record: any) => ({
          ...record,
          img: formatImageUrl(record.img)
        }));
      }
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      isLoadingAudit.value = false;
    }
  };

  // 设置筛选状态并重新加载
  const setAuditFilter = (status: 'pending' | 'approved' | 'rejected') => {
    auditFilter.value = status;
    loadAuditData(status);
  };

  // 审核统计数据
  const auditStatsData = ref({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // 统计数据 (使用真实数据)
  const auditStats = computed(() => auditStatsData.value);

  // --- 搜索与筛选逻辑 ---
  const searchQuery = ref('');
  const selectedMaterial = ref('所有材料');
  const materialOptions = ref(['所有材料', '可回收垃圾', '有害垃圾', '厨余垃圾', '其他垃圾']);

  // 过滤后的审核记录
  const filteredAuditRecords = computed(() => {
    return auditRecords.value.filter(record => {
      // 1. 搜索过滤 (匹配用户名或站点名)
      const query = searchQuery.value.toLowerCase().trim();
      const matchSearch = query
        ? (record.user?.toLowerCase().includes(query) || record.stationName?.toLowerCase().includes(query))
        : true;

      // 2. 材料过滤
      // 假设 aiResult 格式为 "可回收垃圾 - 塑料瓶 (98%)" 或类似包含分类的字符串
      // 或者 record.aiResult 直接就是分类名称，这里做模糊匹配
      const matchMaterial = selectedMaterial.value === '所有材料'
        ? true
        : record.aiResult?.includes(selectedMaterial.value);

      return matchSearch && matchMaterial;
    });
  });

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
        auditRecords.value = auditRecords.value.filter((r: PendingRecord) => r.id !== record.id);
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
          auditRecords.value = auditRecords.value.filter((r: PendingRecord) => r.id !== record.id);
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

  // 复制批次号到剪贴板
  const copyBatchNo = async (batchNo: string) => {
    try {
      await navigator.clipboard.writeText(batchNo);
      showToast(`批次号 ${batchNo} 已复制，可前往溯源页面查询`, 'success');
    } catch (error) {
      console.error('复制失败:', error);
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const handleImageError = (e: Event, record?: any) => {
    const img = e.target as HTMLImageElement;
    console.warn('审核图片加载失败:', img.src);
    // 如果是单条记录的错误，可以在记录上标记
    if (record) {
      record.imgError = true;
    }
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
    selectedAiStation,
    recognitionResult,
    adjustCount,
    // 管理员
    activeTab,
    selectedStation,
    qrCodeUrl,
    currentQRStationName,
    stations,
    generateQR,
    downloadQR,
    exportCSV,
    auditRecords,
    auditFilter,
    sectionTitle,
    setAuditFilter,
    auditStats,
    previewImageState,
    approve,
    reject,
    previewImg,
    closePreview,
    isLoadingAudit,
    loadAuditData,
    handleImageError,
    // 搜索与筛选
    searchQuery,
    selectedMaterial,
    materialOptions,
    filteredAuditRecords,
    // 批次号复制
    copyBatchNo
  };
}
