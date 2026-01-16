import { ref, computed } from 'vue';
import { store } from '../../stores';
import img1 from '../../assets/images/1.jpg';
import img2 from '../../assets/images/2.jpg';

export function useCheckin() {
  const isAdmin = computed(() => store.isAdmin);

  const aiResult = ref(false);
  const activeTab = ref('audit');
  const selectedStation = ref('1');
  const qrCodeUrl = ref('');

  const triggerAiCheck = () => {
    // 模拟 AI 识别延迟
    setTimeout(() => {
      aiResult.value = true;
    }, 1500);
  };

  const triggerScan = () => {
    alert('正在启动摄像头扫码...');
  };

  const confirmCheckin = () => {
    alert('打卡成功！积分已发放。');
    aiResult.value = false;
  };

  const generateQR = () => {
    qrCodeUrl.value = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PureOcean_Station_001';
  };

  const downloadQR = () => {
    alert('二维码已开始下载');
  };

  // 模拟审核数据
  const mockRecords = ref([
    { id: 1, user: '王小明', img: img1, aiResult: 'PET瓶 0.5kg', time: '10-26 14:20' },
    { id: 2, user: '陈美美', img: img2, aiResult: '混合塑料 1.2kg', time: '10-26 15:10' }
  ]);

  const approve = (record: any) => {
    alert(`已通过 ${record.user} 的打卡申请`);
    mockRecords.value = mockRecords.value.filter(r => r.id !== record.id);
  };

  const reject = (record: any) => {
    if (confirm(`确定要驳回 ${record.user} 的打卡申请吗？`)) {
      mockRecords.value = mockRecords.value.filter(r => r.id !== record.id);
    }
  };

  const previewImg = (url: string) => {
    window.open(url, '_blank');
  };

  return {
    isAdmin,
    aiResult,
    activeTab,
    selectedStation,
    qrCodeUrl,
    triggerAiCheck,
    triggerScan,
    confirmCheckin,
    generateQR,
    downloadQR,
    mockRecords,
    approve,
    reject,
    previewImg
  };
}
