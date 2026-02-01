import { ref, computed } from 'vue';
import { store } from '../../stores';

const isAdmin = computed(() => store.isAdmin);

const searchQuery = ref('');
const showResult = ref(false);
const isLoading = ref(false);
const searchError = ref('');
const searchResult = ref<any>(null);

// 管理员视图数据
const traceList = ref<any[]>([]);

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
      searchResult.value = json.data;
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
      traceList.value = json.data;
    }
  } catch (error) {
    console.error('获取列表失败', error);
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
  handleSearch,
  fetchAdminList
}

