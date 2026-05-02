import { ref, computed } from 'vue';
import { store } from '../../stores';
import { getStations, type Station } from '../../api/checkin';

const isAdmin = computed(() => store.isAdmin);

const searchQuery = ref('');
const showResult = ref(false);
const isLoading = ref(false);
const searchError = ref('');
const searchResult = ref<any>(null);

// 管理员视图数据
const traceList = ref<any[]>([]);
const stations = ref<Station[]>([]);
const isDialogOpen = ref(false);
const isEditing = ref(false);
const isImageViewerOpen = ref(false);
const viewerImageUrl = ref('');
const currentRecord = ref<any>({
  weight: 0,
  wasteType: '塑料瓶',
  stationId: null,
  status: 'completed'
});

const loadStations = async () => {
  try {
    const res = await getStations(true);
    if (res.success) {
      stations.value = res.data;
    }
  } catch (error) {
    console.error('加载站点失败', error);
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  currentRecord.value = {
    weight: 0,
    wasteType: '塑料瓶',
    stationId: null,
    status: 'completed'
  };
  isDialogOpen.value = true;
};

const viewImage = (url: string) => {
  if (!url) return;
  viewerImageUrl.value = url;
  isImageViewerOpen.value = true;
};

const openEditDialog = (record: any) => {
  isEditing.value = true;
  currentRecord.value = { ...record };
  isDialogOpen.value = true;
};

const saveRecord = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = isEditing.value 
      ? `/api/trace/admin/update/${currentRecord.value.batchNo}`
      : '/api/trace/admin/create';
    
    const method = isEditing.value ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(currentRecord.value)
    });
    
    const json = await res.json();
    if (json.success) {
      isDialogOpen.value = false;
      await fetchAdminList();
      alert(isEditing.value ? '更新成功' : '创建成功');
    } else {
      alert(json.message || '保存失败');
    }
  } catch (error) {
    console.error('保存记录失败', error);
    alert('网络错误，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

const deleteRecord = async (batchNo: string) => {
  if (!confirm(`确定要删除批次 ${batchNo} 吗？`)) return;
  
  isLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/trace/admin/delete/${batchNo}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const json = await res.json();
    if (json.success) {
      await fetchAdminList();
    } else {
      alert(json.message || '删除失败');
    }
  } catch (error) {
    console.error('删除失败', error);
    alert('网络错误，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

const exportReport = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/trace/admin/export', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `溯源报表_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('导出失败');
    }
  } catch (error) {
    console.error('导出失败', error);
    alert('网络错误，请稍后重试');
  }
};

const processImageUrl = (url: string) => {
  if (!url) return '';
  let processedUrl = url.replace(/\\/g, '/'); // 统一将反斜杠替换为正斜杠
  // 如果后端返回的是完整 URL 且包含 localhost，替换为当前访问的 host (针对移动端调试)
  if (processedUrl.startsWith('http://localhost') || processedUrl.startsWith('http://127.0.0.1')) {
    processedUrl = processedUrl.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, window.location.origin);
  }
  // 如果是相对路径 (例如 /uploads/...)
  else if (!processedUrl.startsWith('http') && !processedUrl.startsWith('data:')) {
    // 统一补全 /api 前缀，让 Vite 代理处理
    const prefix = '/api';
    processedUrl = `${prefix}${processedUrl.startsWith('/') ? '' : '/'}${processedUrl}`;
  }
  return processedUrl;
};

const handleSearch = async () => {
  if (!searchQuery.value) return;

  showResult.value = false;
  isLoading.value = true;
  searchError.value = '';
  searchResult.value = null;

  try {
    const res = await fetch(`/api/trace/${searchQuery.value}`);
    const json = await res.json();

    if (json.success) {
      const data = json.data;
      // 检查并修正图片 URL
      if (data && data.imageUrl) {
        data.imageUrl = processImageUrl(data.imageUrl);
      }
      searchResult.value = data;
      showResult.value = true;
    } else {
      searchError.value = json.message || '未找到该批次的溯源信息，请检查批次号是否正确。';
      showResult.value = true;
    }
  } catch (err: any) {
    searchError.value = '网络错误，请稍后重试';
    showResult.value = true;
  } finally {
    isLoading.value = false;
  }
};

const fetchAdminList = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/trace/admin/list', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (json.success) {
      traceList.value = json.data.map((item: any) => ({
        ...item,
        imageUrl: processImageUrl(item.imageUrl)
      }));
    }
  } catch (error) {
    console.error('获取列表失败', error);
  }
};

const handleImageError = (e: Event) => {
  console.warn('图片加载失败，可能是路径不正确或网络超时:', (e.target as HTMLImageElement).src);
  if (searchResult.value) {
    searchResult.value.imageUrl = null;
  }
};

export {
  isAdmin,
  searchQuery,
  showResult,
  isLoading,
  searchError,
  searchResult,
  traceList,
  stations,
  isDialogOpen,
  isEditing,
  currentRecord,
  openCreateDialog,
  openEditDialog,
  saveRecord,
  deleteRecord,
  exportReport,
  handleSearch,
  handleImageError, // 导出错误处理函数
  fetchAdminList,
  loadStations,
  viewImage,
  isImageViewerOpen,
  viewerImageUrl
}

