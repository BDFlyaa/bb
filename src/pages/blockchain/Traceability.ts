import { ref, computed } from 'vue';
import { store } from '../../stores';

const isAdmin = computed(() => store.isAdmin);

const searchQuery = ref('');
const showResult = ref(false);
const isLoading = ref(false);
const searchError = ref('');
const searchResult = ref<any>(null);

const showLogisticsModal = ref(false);

const newLogistics = ref({
  batch: '',
  carrier: '',
  dest: ''
});

// 模拟区块链数据概览（管理员用）
const blockchainData = ref([
  { 
    hash: '0x7f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', 
    batch: 'B-20231024-01', 
    time: '2023-10-24 10:42:15',
    weight: '50.5 kg',
    source: '站点 A - 阳光海滩',
    status: 'processing'
  },
  { 
    hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', 
    batch: 'B-20231024-02', 
    time: '2023-10-24 11:15:30',
    weight: '120.0 kg',
    source: '站点 C - 河口拦截网',
    status: 'completed'
  }
]);

// 模拟详细溯源数据（数据库）
const mockDatabase: Record<string, any> = {
  'B-20231024-01': {
    timeline: [
      { status: 'completed', time: '2023-10-24 10:42', title: '投放回收', desc: '在 [阳光海滩回收站] 完成投放' },
      { status: 'completed', time: '2023-10-24 18:00', title: '物流转运', desc: '由 [极速环保物流] 运往再生处理中心' },
      { status: 'active', time: '2023-10-25 09:30', title: '分拣破碎', desc: '已完成自动化分拣与破碎，进入清洗阶段' },
      { status: 'pending', time: '---', title: '再生加工', desc: '等待进入拉丝造粒工序' }
    ],
    achievement: {
      items: '1.2',
      carbon: '0.65',
      oil: '0.3',
      hash: '0x7f9a...8f9a'
    }
  },
  'B-20231024-02': {
    timeline: [
      { status: 'completed', time: '2023-10-24 11:15', title: '投放回收', desc: '在 [河口拦截网] 完成投放' },
      { status: 'completed', time: '2023-10-24 20:00', title: '物流转运', desc: '由 [绿色运通] 运往再生处理中心' },
      { status: 'completed', time: '2023-10-25 14:00', title: '分拣破碎', desc: '完成清洗与破碎' },
      { status: 'completed', time: '2023-10-26 10:00', title: '再生加工', desc: '已制成 rPET 颗粒，准备出厂' }
    ],
    achievement: {
      items: '3.5',
      carbon: '1.80',
      oil: '0.9',
      hash: '0x3c4d...c2d'
    }
  }
};

const handleSearch = () => {
  if (!searchQuery.value) return;
  
  showResult.value = false;
  isLoading.value = true;
  searchError.value = '';
  searchResult.value = null;

  // 模拟网络延迟
  setTimeout(() => {
    isLoading.value = false;
    const data = mockDatabase[searchQuery.value];
    if (data) {
      searchResult.value = data;
      showResult.value = true;
    } else {
      searchError.value = '未找到该批次的溯源信息，请检查批次号是否正确。';
      showResult.value = true; // 显示结果区域（这里会显示错误信息）
    }
  }, 1000);
};

const saveLogistics = () => {
  if (!newLogistics.value.batch) {
    alert('请输入批次号');
    return;
  }
  // 模拟保存
  alert(`批次 ${newLogistics.value.batch} 的物流信息已存入区块链`);
  
  // 更新本地 mock 数据（简单演示）
  const item = blockchainData.value.find(b => b.batch === newLogistics.value.batch);
  if (item) {
    item.status = 'transporting';
  }
  
  showLogisticsModal.value = false;
  // 重置表单
  newLogistics.value = { batch: '', carrier: '', dest: '' };
};

export {
    isAdmin,
    searchQuery,
    showResult,
    isLoading,
    searchError,
    searchResult,
    showLogisticsModal,
    newLogistics,
    blockchainData,
    handleSearch,
    saveLogistics
}
