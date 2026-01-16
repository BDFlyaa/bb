import { ref, computed, onMounted } from 'vue';
import { store } from '../../stores';

const isAdmin = computed(() => store.isAdmin);

const activeTab = ref('products');
const showMyOrders = ref(false);
const pendingOrders = ref(2);
const activeFilter = ref('all');

// 商品数据
const items = ref([
  { id: 1, name: '环保帆布袋', points: 500, icon: '👜', desc: '100% 再生棉材质，经久耐用', category: 'daily', inventory: 50 },
  { id: 2, name: '再生塑料T恤', points: 1200, icon: '👕', desc: '由 8 个回收塑料瓶拉丝织造', category: 'clothing', inventory: 20 },
  { id: 3, name: '竹制餐具套装', points: 350, icon: '🥢', desc: '天然原竹，零废弃生活首选', category: 'daily', inventory: 8 },
  { id: 4, name: '种子纸明信片', points: 100, icon: '📮', desc: '看完后埋入土中，可长出小花', category: 'other', inventory: 100 }
]);

// 过滤后的商品
const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return items.value;
  return items.value.filter(item => item.category === activeFilter.value);
});

// 我的订单（从 localStorage 读取）
const myOrders = ref<any[]>([]);

onMounted(() => {
  const savedOrders = localStorage.getItem('my_orders');
  if (savedOrders) {
    myOrders.value = JSON.parse(savedOrders);
  }
});

const mockOrders = ref([
  { id: 'ORD-001', user: '王小明', item: '再生塑料T恤', time: '10-28 10:00', status: 'pending', statusText: '待发货' },
  { id: 'ORD-002', user: '陈美美', item: '环保帆布袋', time: '10-27 15:00', status: 'shipped', statusText: '已发货' }
]);

const redeem = (item: any) => {
  if ((store.user.points || 0) < item.points) {
    alert('积分不足！');
    return;
  }
  
  if (item.inventory <= 0) {
    alert('库存不足！');
    return;
  }

  if (confirm(`确定要消耗 ${item.points} 积分兑换 ${item.name} 吗？`)) {
    // 扣除积分
    store.updatePoints(-item.points);
    
    // 扣除库存
    item.inventory--;
    
    // 生成订单
    const newOrder = {
      id: Date.now(),
      name: item.name,
      icon: item.icon,
      points: item.points,
      time: new Date().toLocaleString()
    };
    
    myOrders.value.unshift(newOrder);
    localStorage.setItem('my_orders', JSON.stringify(myOrders.value));
    
    alert('兑换成功！我们将尽快为您寄出。');
  }
};

const shipOrder = (order: any) => {
  alert(`订单 ${order.id} 已标记为发货状态`);
  order.status = 'shipped';
  order.statusText = '已发货';
};

const addProduct = () => alert('打开新增商品表单');
const editProduct = (item: any) => alert(`修改 ${item.name} 的价格`);
const toggleStatus = (item: any) => alert(`已下架商品: ${item.name}`);

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
    store
}
