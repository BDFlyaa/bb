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
          <span class="value">{{ store.user.points || 0 }} 🪙</span>
        </div>
      </div>

      <div class="filter-bar">
        <button 
          :class="['filter-btn', { active: activeFilter === 'all' }]"
          @click="activeFilter = 'all'"
        >全部礼品</button>
        <button 
          :class="['filter-btn', { active: activeFilter === 'daily' }]"
          @click="activeFilter = 'daily'"
        >生活用品</button>
        <button 
          :class="['filter-btn', { active: activeFilter === 'clothing' }]"
          @click="activeFilter = 'clothing'"
        >环保服饰</button>
        <button class="filter-btn" @click="showMyOrders = true">兑换记录</button>
      </div>

      <div class="products-grid">
        <div class="product-card glass-panel" v-for="item in filteredItems" :key="item.id">
          <div class="product-icon">{{ item.icon }}</div>
          <div class="product-info">
            <h4>{{ item.name }}</h4>
            <p class="desc">{{ item.desc }}</p>
            <div class="stock-info" v-if="item.inventory < 10">
              仅剩 {{ item.inventory }} 件
            </div>
            <div class="price-row">
              <span class="points">{{ item.points }} 🪙</span>
              <button 
                class="btn-primary btn-sm" 
                :disabled="item.inventory <= 0 || (store.user.points || 0) < item.points"
                @click="redeem(item)"
              >
                {{ item.inventory <= 0 ? '已售罄' : ((store.user.points || 0) < item.points ? '积分不足' : '立即兑换') }}
              </button>
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
            >
              <span class="tab-icon">🛍️</span>
              商品管理
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'orders' }]" 
              @click="activeTab = 'orders'"
            >
              <span class="tab-icon">📋</span>
              订单处理 
              <span class="badge" v-if="pendingOrders > 0">{{ pendingOrders }}</span>
            </button>
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
              <td>{{ item.inventory }}</td>
              <td>
                <span :class="['status-tag', item.inventory > 0 ? 'success' : 'danger']">
                  {{ item.inventory > 0 ? '销售中' : '已售罄' }}
                </span>
              </td>
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
        <div class="order-list" v-if="myOrders.length > 0">
          <div v-for="order in myOrders" :key="order.id" class="order-item">
            <span class="icon">{{ order.icon }}</span>
            <div class="info">
              <p class="name">{{ order.name }}</p>
              <p class="time">{{ order.time }}</p>
            </div>
            <span class="status success">兑换成功</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无兑换记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
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
} from './Mall';
</script>

<style scoped src="./Mall.css"></style>