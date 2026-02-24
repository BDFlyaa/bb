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
          order.status === 'completed' ? '已完成' : '已取消',
      address: order.address,
      phone: order.phone
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

const showRedeemSuccessModal = ref(false);
const redeemSuccessMessage = ref('');
const showRedeemModal = ref(false);
const currentRedeemItem = ref<any>(null);
const redeemForm = ref({
    name: '',
    phone: '',
    address: ''
});
const redeemFormErrors = ref({
    name: '',
    phone: '',
    address: ''
});

const closeRedeemSuccessModal = () => {
    showRedeemSuccessModal.value = false;
};

const closeRedeemModal = () => {
    showRedeemModal.value = false;
    redeemFormErrors.value = { name: '', phone: '', address: '' };
};

const redeem = (item: any) => {
  if ((store.user.points || 0) < item.points) {
    alert('积分不足！');
    return;
  }

  if (item.inventory <= 0) {
    alert('库存不足！');
    return;
  }

  currentRedeemItem.value = item;
  // 预填一些用户信息如果 store 里有的话（假设 store.user 只有 username 和 points，这里先留空）
  redeemForm.value = { name: '', phone: '', address: '' };
  redeemFormErrors.value = { name: '', phone: '', address: '' };
  showRedeemModal.value = true;
};

const submitRedeem = async () => {
    // 验证
    let isValid = true;
    redeemFormErrors.value = { name: '', phone: '', address: '' };

    if (!redeemForm.value.name.trim()) {
        redeemFormErrors.value.name = '请输入收货人姓名';
        isValid = false;
    }

    if (!redeemForm.value.phone.trim()) {
        redeemFormErrors.value.phone = '请输入联系电话';
        isValid = false;
    } else if (!/^1[3-9]\d{9}$/.test(redeemForm.value.phone)) {
        redeemFormErrors.value.phone = '请输入有效的手机号码';
        isValid = false;
    }

    if (!redeemForm.value.address.trim()) {
        redeemFormErrors.value.address = '请输入详细收货地址';
        isValid = false;
    }

    if (!isValid) return;

    if (!currentRedeemItem.value) return;

    const item = currentRedeemItem.value;
    // 拼接地址信息
    const fullAddress = `${redeemForm.value.name}, ${redeemForm.value.address}`;

    isSubmitting.value = true;
    try {
        await axios.post(`${API_URL}/redeem/${item.id}`, {
            address: fullAddress,
            phone: redeemForm.value.phone
        }, {
            headers: { Authorization: `Bearer ${store.token}` }
        });

        // 更新本地积分
        store.updatePoints(-item.points);

        // 更新本地库存
        item.inventory--;

        // 刷新订单列表
        await fetchOrders();

        // 关闭兑换模态框
        showRedeemModal.value = false;

        // 显示成功模态框
        redeemSuccessMessage.value = `成功兑换 ${item.name}！我们将尽快为您寄出。`;
        showRedeemSuccessModal.value = true;

    } catch (error: any) {
        alert(error.response?.data?.message || '兑换失败，请稍后重试');
    } finally {
        isSubmitting.value = false;
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
    // alert(`订单 ${order.id} 已标记为发货状态`);
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const unshipOrder = async (order: any) => {
  if (!confirmData.value) return;

  confirmData.value = {
    title: '取消发货确认',
    message: `确定要取消订单 ${order.id} 的发货状态吗？这将使其恢复为待发货。`,
    type: 'warning',
    action: async () => {
      try {
        await axios.put(`${API_URL}/admin/orders/${order.orderId}/unship`, {}, {
          headers: { Authorization: `Bearer ${store.token}` }
        });
        order.status = 'pending';
        order.statusText = '待发货';
        pendingOrders.value++;
        // alert(`订单 ${order.id} 已恢复为待发货状态`);
      } catch (error: any) {
        alert(error.response?.data?.message || '操作失败');
      }
    }
  };
  showConfirmModal.value = true;
};

const cancelOrder = async (order: any) => {
  if (!confirmData.value) return;

  confirmData.value = {
    title: '订单取消确认',
    message: `确定要取消订单 ${order.id} 吗？此操作将使订单失效。`,
    type: 'warning',
    action: async () => {
      try {
        await axios.put(`${API_URL}/admin/orders/${order.orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${store.token}` }
        });
        order.status = 'cancelled';
        order.statusText = '已取消';
        if (order.status === 'pending') {
            pendingOrders.value--;
        }
        // alert(`订单 ${order.id} 已取消`);
      } catch (error: any) {
        alert(error.response?.data?.message || '操作失败');
      }
    }
  };
  showConfirmModal.value = true;
};

const showOrderDetailsModal = ref(false);
const currentOrder = ref<any>(null);

const viewOrderDetails = (order: any) => {
    currentOrder.value = order;
    showOrderDetailsModal.value = true;
};

const closeOrderDetailsModal = () => {
    showOrderDetailsModal.value = false;
    currentOrder.value = null;
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

const showEditProductModal = ref(false);
const editProductForm = ref({
  id: '',
  name: '',
  points: 0,
  inventory: 0
});
const editFormErrors = ref({
    points: '',
    inventory: ''
});

const closeEditProductModal = () => {
    showEditProductModal.value = false;
    editFormErrors.value = { points: '', inventory: '' };
};

const editProduct = (item: any) => {
    editProductForm.value = {
        id: item.id,
        name: item.name,
        points: item.points,
        inventory: item.inventory
    };
    editFormErrors.value = { points: '', inventory: '' };
    showEditProductModal.value = true;
};

const submitEditProduct = async () => {
    // validation
    editFormErrors.value = { points: '', inventory: '' };
    let isValid = true;
    
    if (editProductForm.value.points <= 0) {
        editFormErrors.value.points = '积分必须大于0';
        isValid = false;
    }
    
    if (editProductForm.value.inventory < 0) {
        editFormErrors.value.inventory = '库存不能为负数';
        isValid = false;
    }
    
    if (!isValid) return;
    
    isSubmitting.value = true;
    try {
        await axios.put(`${API_URL}/products/${editProductForm.value.id}`, {
            points: Number(editProductForm.value.points),
            inventory: Number(editProductForm.value.inventory)
        }, {
            headers: { Authorization: `Bearer ${store.token}` }
        });
        
        // Update local item
        const item = items.value.find((i: any) => i.id === editProductForm.value.id);
        if (item) {
            item.points = Number(editProductForm.value.points);
            item.inventory = Number(editProductForm.value.inventory);
        }
        
        alert('商品更新成功！');
        showEditProductModal.value = false;
    } catch (error: any) {
        alert(error.response?.data?.message || '更新失败');
    } finally {
        isSubmitting.value = false;
    }
};

const deleteProduct = async (item: any) => {
  if (!confirmData.value) return;

  confirmData.value = {
    title: '删除确认',
    message: `您确定要删除商品 "${item.name}" 吗？此操作无法撤销。`,
    type: 'warning',
    action: async () => {
      try {
        await axios.delete(`${API_URL}/products/${item.id}`, {
          headers: { Authorization: `Bearer ${store.token}` }
        });
        
        // 从列表中移除
        items.value = items.value.filter((i: any) => i.id !== item.id);
        
        
      } catch (error: any) {
        alert(error.response?.data?.message || '删除失败');
      }
    }
  };
  showConfirmModal.value = true;
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
          await axios.put(`${API_URL}/products/${item.id}`, {
            status: 'inactive'
          }, {
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
  executeConfirmAction,
  showEditProductModal,
  editProductForm,
  editFormErrors,
  closeEditProductModal,
  submitEditProduct,
  deleteProduct,
  showRedeemSuccessModal,
  redeemSuccessMessage,
  closeRedeemSuccessModal,
  showRedeemModal,
  currentRedeemItem,
  redeemForm,
  redeemFormErrors,
  closeRedeemModal,
  submitRedeem,
  cancelOrder,
  unshipOrder,
  showOrderDetailsModal,
  currentOrder,
  viewOrderDetails,
  closeOrderDetailsModal
}
