<template>
  <div class="mall-view">
    <!-- 志愿者视图 -->
    <div v-if="!isAdmin">
      <div class="header-section">
        <div class="title-area">
          <h2>🎁 积分商城</h2>
          <p>用您的环保贡献换取精美礼品</p>
        </div>
        <div class="user-status glass-panel">
          <span class="label">我的积分</span>
          <span class="value">1,250 🪙</span>
        </div>
      </div>

      <div class="filter-bar">
        <button class="filter-btn active">全部礼品</button>
        <button class="filter-btn">生活用品</button>
        <button class="filter-btn">环保服饰</button>
        <button class="filter-btn" @click="showMyOrders = true">兑换记录</button>
      </div>

      <div class="products-grid">
        <div class="product-card glass-panel" v-for="item in items" :key="item.id">
          <div class="product-icon">{{ item.icon }}</div>
          <div class="product-info">
            <h4>{{ item.name }}</h4>
            <p class="desc">{{ item.desc }}</p>
            <div class="price-row">
              <span class="points">{{ item.points }} 🪙</span>
              <button class="btn-primary btn-sm" @click="redeem(item)">立即兑换</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 管理员视图 -->
    <div v-else>
      <div class="header-section">
        <div class="title-area">
          <h2>📦 商城运维中心</h2>
          <div class="admin-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'products' }]" 
              @click="activeTab = 'products'"
            >商品管理</button>
            <button 
              :class="['tab-btn', { active: activeTab === 'orders' }]" 
              @click="activeTab = 'orders'"
            >订单处理 ({{ pendingOrders }})</button>
          </div>
        </div>
        <button v-if="activeTab === 'products'" class="btn-primary" @click="addProduct">➕ 上架新商品</button>
      </div>

      <!-- 商品管理 -->
      <div v-if="activeTab === 'products'" class="admin-content glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>商品</th>
              <th>积分价格</th>
              <th>库存</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div class="product-cell">
                  <span class="icon">{{ item.icon }}</span>
                  <span>{{ item.name }}</span>
                </div>
              </td>
              <td>{{ item.points }}</td>
              <td>99+</td>
              <td><span class="status-tag success">销售中</span></td>
              <td>
                <button class="btn-sm btn-ghost" @click="editProduct(item)">修改价格</button>
                <button class="btn-sm btn-danger" @click="toggleStatus(item)">下架</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 订单处理 -->
      <div v-else class="admin-content glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>兑换用户</th>
              <th>礼品内容</th>
              <th>下单时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in mockOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.user }}</td>
              <td>{{ order.item }}</td>
              <td>{{ order.time }}</td>
              <td><span :class="['status-tag', order.status]">{{ order.statusText }}</span></td>
              <td>
                <button v-if="order.status === 'pending'" class="btn-sm btn-success" @click="shipOrder(order)">处理发货</button>
                <button v-else class="btn-sm btn-ghost" disabled>已处理</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 兑换记录模态框 -->
    <div v-if="showMyOrders" class="modal-overlay" @click.self="showMyOrders = false">
      <div class="modal-content glass-panel">
        <h3>我的兑换记录</h3>
        <div class="order-list">
          <div v-for="o in 3" :key="o" class="order-item">
            <span class="icon">👜</span>
            <div class="info">
              <p class="name">环保帆布袋</p>
              <p class="time">2023-10-20 14:00</p>
            </div>
            <span class="status shipped">已发货</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { store } from '../../stores';

const isAdmin = computed(() => store.isAdmin);

const activeTab = ref('products');
const showMyOrders = ref(false);
const pendingOrders = ref(2);

const items = ref([
  { id: 1, name: '环保帆布袋', points: 500, icon: '👜', desc: '100% 再生棉材质，经久耐用' },
  { id: 2, name: '再生塑料T恤', points: 1200, icon: '👕', desc: '由 8 个回收塑料瓶拉丝织造' },
  { id: 3, name: '竹制餐具套装', points: 350, icon: '🥢', desc: '天然原竹，零废弃生活首选' },
  { id: 4, name: '种子纸明信片', points: 100, icon: '📮', desc: '看完后埋入土中，可长出小花' }
]);

const mockOrders = ref([
  { id: 'ORD-001', user: '王小明', item: '再生塑料T恤', time: '10-28 10:00', status: 'pending', statusText: '待发货' },
  { id: 'ORD-002', user: '陈美美', item: '环保帆布袋', time: '10-27 15:00', status: 'shipped', statusText: '已发货' }
]);

const redeem = (item: any) => {
  if (confirm(`确定要消耗 ${item.points} 积分兑换 ${item.name} 吗？`)) {
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
</script>

<style scoped>
.mall-view {
  padding: 10px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.title-area h2 {
  margin-bottom: 5px;
  background: linear-gradient(to right, #fff, #00b4db);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-area p {
  color: #888;
  font-size: 0.9rem;
}

.user-status {
  padding: 15px 25px;
  text-align: right;
}

.user-status .label {
  display: block;
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 5px;
}

.user-status .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

/* 过滤器 */
.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aaa;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.filter-btn.active, .filter-btn:hover {
  background: rgba(0, 229, 255, 0.1);
  color: #00e5ff;
  border-color: #00e5ff;
}

/* 商品网格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  padding: 0;
  overflow: hidden;
  transition: 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  border-color: #00e5ff;
}

.product-icon {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  background: rgba(255, 255, 255, 0.03);
}

.product-info {
  padding: 20px;
}

.product-info h4 {
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.product-info .desc {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 20px;
  height: 40px;
  overflow: hidden;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-row .points {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.2rem;
}

/* 管理员界面 */
.admin-tabs {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.tab-btn {
  background: none;
  border: none;
  color: #888;
  padding: 8px 0;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #00e5ff;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00e5ff;
}

.admin-content {
  padding: 20px;
  margin-top: 20px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-cell .icon {
  font-size: 1.5rem;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 30px;
}

.order-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.order-item .icon { font-size: 2rem; }
.order-item .info { flex: 1; }
.order-item .info .name { font-weight: bold; }
.order-item .info .time { font-size: 0.8rem; color: #666; }
.order-item .status { font-size: 0.8rem; padding: 2px 8px; border-radius: 4px; }
.order-item .status.shipped { background: rgba(82, 196, 26, 0.1); color: #52c41a; }
</style>