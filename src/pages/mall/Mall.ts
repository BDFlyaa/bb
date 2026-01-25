import { ref, computed } from 'vue';
import { store } from '../../stores';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/mall';

const isAdmin = computed(() => store.isAdmin);

const activeTab = ref('products');
const showMyOrders = ref(false);
const pendingOrders = ref(0);
const activeFilter = ref('all');
const isLoading = ref(false);

// 商品数据（从后端获取）
const items = ref<any[]>([]);

// 过滤后的商品
const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return items.value;
  return items.value.filter(item => item.category === activeFilter.value);
});

// 我的订单（从后端获取）
const myOrders = ref<any[]>([]);

// 管理员订单列表
const mockOrders = ref<any[]>([]);

// 获取商品列表
const fetchProducts = async () => {
  try {
    isLoading.value = true;
    const url = isAdmin.value ? `${API_URL}/admin/products` : `${API_URL}/products`;
    const headers = store.token ? { Authorization: `Bearer ${store.token}` } : {};
    const response = await axios.get(url, { headers });
    items.value = response.data;
  } catch (error) {
    console.error('获取商品失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 获取用户订单
const fetchOrders = async () => {
  if (!store.token) return;
  try {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    myOrders.value = response.data.map((order: any) => ({
      id: order.id,
      name: order.productName,
      icon: order.productIcon,
      points: order.pointsCost,
      time: new Date(order.createdAt).toLocaleString(),
      status: order.status
    }));
  } catch (error) {
    console.error('获取订单失败:', error);
  }
};

// 获取管理员订单列表
const fetchAdminOrders = async () => {
  if (!store.token || !isAdmin.value) return;
  try {
    const response = await axios.get(`${API_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    mockOrders.value = response.data.map((order: any) => ({
      id: `ORD-${String(order.id).padStart(3, '0')}`,
      orderId: order.id,
      user: order.user?.username || '未知用户',
      item: order.productName,
      time: new Date(order.createdAt).toLocaleString(),
      status: order.status,
      statusText: order.status === 'pending' ? '待发货' :
        order.status === 'shipped' ? '已发货' :
          order.status === 'completed' ? '已完成' : '已取消'
    }));
    pendingOrders.value = mockOrders.value.filter((o: any) => o.status === 'pending').length;
  } catch (error) {
    console.error('获取管理员订单失败:', error);
  }
};

// 初始化函数 - 必须在组件的 setup 或 onMounted 中调用
const initMall = async () => {
  if (store.isLoggedIn) {
    await store.fetchUserProfile();
  }
  await fetchProducts();
  if (store.isLoggedIn) {
    await fetchOrders();
    if (isAdmin.value) {
      await fetchAdminOrders();
    }
  }
};

const redeem = async (item: any) => {
  if ((store.user.points || 0) < item.points) {
    alert('积分不足！');
    return;
  }

  if (item.inventory <= 0) {
    alert('库存不足！');
    return;
  }

  if (confirm(`确定要消耗 ${item.points} 积分兑换 ${item.name} 吗？`)) {
    try {
      await axios.post(`${API_URL}/redeem/${item.id}`, {}, {
        headers: { Authorization: `Bearer ${store.token}` }
      });

      // 更新本地积分
      store.updatePoints(-item.points);

      // 更新本地库存
      item.inventory--;

      // 刷新订单列表
      await fetchOrders();

      alert('兑换成功！我们将尽快为您寄出。');
    } catch (error: any) {
      alert(error.response?.data?.message || '兑换失败，请稍后重试');
    }
  }
};

const shipOrder = async (order: any) => {
  try {
    await axios.put(`${API_URL}/admin/orders/${order.orderId}/ship`, {}, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    order.status = 'shipped';
    order.statusText = '已发货';
    pendingOrders.value--;
    alert(`订单 ${order.id} 已标记为发货状态`);
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const showAddProductModal = ref(false);
const showConfirmModal = ref(false);
const confirmData = ref({
  title: '',
  message: '',
  type: 'warning',
  action: null as (() => Promise<void>) | null
});

const isSubmitting = ref(false);
const previewImage = ref('');

const productForm = ref({
  name: '',
  points: 100,
  icon: '🎁',
  description: '',
  category: 'other',
  inventory: 10
});

const formErrors = ref({
  name: '',
  points: '',
  icon: '',
  inventory: ''
});

// 处理文件选择
const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
      // 将图片 Base64 赋值给 icon 字段，以便提交到后端
      productForm.value.icon = previewImage.value;
    };
    reader.readAsDataURL(file);
  }
};

// 移除图片预览
const removePreview = () => {
  previewImage.value = '';
  const fileInput = document.getElementById('product-image-upload') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
};

const closeAddProductModal = () => {
  showAddProductModal.value = false;
};

const submitProduct = async () => {
  // 验证
  let isValid = true;
  formErrors.value = { name: '', points: '', icon: '', inventory: '' };

  if (!productForm.value.name.trim()) {
    formErrors.value.name = '请输入商品名称';
    isValid = false;
  }

  if (productForm.value.points <= 0) {
    formErrors.value.points = '积分必须大于0';
    isValid = false;
  }

  if (!productForm.value.inventory && productForm.value.inventory !== 0) {
    formErrors.value.inventory = '库存不能为负数';
    isValid = false;
  }

  // 图片验证逻辑：虽然可以为空（使用默认），但如果想强制验证可以在这里开启
  // 目前策略：允许为空，后端会填充默认值
  
  if (!isValid) return;

  isSubmitting.value = true;

  try {
    const submitData = {
      ...productForm.value,
      icon: previewImage.value // 只使用上传的图片，忽略 productForm.icon
    };

    await axios.post(`${API_URL}/products`, submitData, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    
    alert('商品添加成功！');
    showAddProductModal.value = false;
    await fetchProducts();
  } catch (error: any) {
    alert(error.response?.data?.message || '添加失败');
  } finally {
    isSubmitting.value = false;
  }
};

const addProduct = async () => {
  productForm.value = {
    name: '',
    points: 100,
    icon: '', // 初始化为空，由上传图片填充
    description: '',
    category: 'other',
    inventory: 10
  };
  previewImage.value = '';
  formErrors.value = {
    name: '',
    points: '',
    icon: '',
    inventory: ''
  };
  showAddProductModal.value = true;
};

const editProduct = async (item: any) => {
  const newPoints = prompt(`修改 ${item.name} 的积分价格`, String(item.points));
  if (!newPoints || isNaN(Number(newPoints))) return;

  const newInventory = prompt('修改库存数量', String(item.inventory));
  if (newInventory === null || isNaN(Number(newInventory))) return;

  try {
    await axios.put(`${API_URL}/products/${item.id}`, {
      points: Number(newPoints),
      inventory: Number(newInventory)
    }, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    item.points = Number(newPoints);
    item.inventory = Number(newInventory);
    alert('商品更新成功！');
  } catch (error: any) {
    alert(error.response?.data?.message || '更新失败');
  }
};

const closeConfirmModal = () => {
  showConfirmModal.value = false;
  confirmData.value.action = null;
};

const executeConfirmAction = async () => {
  if (confirmData.value.action) {
    await confirmData.value.action();
  }
  closeConfirmModal();
};

const toggleStatus = async (item: any) => {
  console.log('toggleStatus called for:', item);
  
  if (!item) {
    console.error('Item is undefined');
    return;
  }

  const isInactive = item.status === 'inactive';
  const actionText = isInactive ? '上架' : '下架';
  
  // 确保 confirmData 已经被定义且是响应式的
  if (!confirmData.value) {
    console.error('confirmData is not initialized');
    return;
  }

  confirmData.value = {
    title: `${actionText}确认`,
    message: `您确定要${actionText}商品 "${item.name}" 吗？此操作将立即生效。`,
    type: isInactive ? 'success' : 'warning',
    action: async () => {
      try {
        console.log(`Executing ${actionText} action...`);
        if (isInactive) {
          // 重新上架逻辑
          await axios.put(`${API_URL}/products/${item.id}`, {
            status: 'active'
          }, {
            headers: { Authorization: `Bearer ${store.token}` }
          });
          item.status = 'active';
        } else {
          // 下架逻辑
          await axios.delete(`${API_URL}/products/${item.id}`, {
            headers: { Authorization: `Bearer ${store.token}` }
          });
          item.status = 'inactive';
        }
        console.log(`${actionText} success`);
        await fetchProducts();
      } catch (error: any) {
        console.error(`${actionText} failed:`, error);
        alert(error.response?.data?.message || `${actionText}失败`);
      }
    }
  };
  
  console.log('Setting showConfirmModal to true');
  showConfirmModal.value = true;
};

export {
  isAdmin,
  activeTab,
  showMyOrders,
  pendingOrders,
  activeFilter,
  items,
  filteredItems,
  myOrders,
  mockOrders,
  redeem,
  shipOrder,
  addProduct,
  editProduct,
  toggleStatus,
  store,
  isLoading,
  fetchProducts,
  fetchOrders,
  fetchAdminOrders,
  initMall,
  showAddProductModal,
  productForm,
  formErrors,
  previewImage,
  isSubmitting,
  closeAddProductModal,
  submitProduct,
  handleFileChange,
  removePreview,
  showConfirmModal,
  confirmData,
  closeConfirmModal,
  executeConfirmAction
}
