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
          <div class="product-icon">
            <img v-if="item.icon && (item.icon.startsWith('data:image') || item.icon.startsWith('http'))" :src="item.icon" alt="商品图片">
            <span v-else>{{ item.icon }}</span>
          </div>
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
                  <div class="icon">
                    <img v-if="item.icon && (item.icon.startsWith('data:image') || item.icon.startsWith('http'))" :src="item.icon" style="width:100%; height:100%; object-fit:cover; border-radius:4px;" alt="icon">
                    <span v-else>{{ item.icon }}</span>
                  </div>
                  <span>{{ item.name }}</span>
                </div>
              </td>
              <td>{{ item.points }}</td>
              <td>{{ item.inventory }}</td>
              <td>
                <span :class="['status-tag', item.status === 'inactive' ? 'danger' : (item.inventory > 0 ? 'success' : 'warning')]">
                  {{ item.status === 'inactive' ? '已下架' : (item.inventory > 0 ? '销售中' : '已售罄') }}
                </span>
              </td>
              <td>
                <button class="btn-sm btn-ghost" @click="editProduct(item)">修改价格</button>
                <button 
                  :class="['btn-sm', item.status === 'inactive' ? 'btn-success' : 'btn-danger']" 
                  @click="toggleStatus(item)"
                >
                  {{ item.status === 'inactive' ? '上架' : '下架' }}
                </button>
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

    <!-- 添加商品模态框 -->
    <div v-if="showAddProductModal" class="modal-overlay" @click.self="closeAddProductModal">
      <div class="modal-content glass-panel">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0;">✨ 上架新商品</h3>
          <button style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;" @click="closeAddProductModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>商品名称</label>
            <input 
              type="text" 
              class="form-input" 
              v-model="productForm.name" 
              placeholder="请输入商品名称"
            >
            <div class="error-msg" v-if="formErrors.name">{{ formErrors.name }}</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>积分价格</label>
              <input 
                type="number" 
                class="form-input" 
                v-model="productForm.points" 
                min="1"
              >
              <div class="error-msg" v-if="formErrors.points">{{ formErrors.points }}</div>
            </div>
            
            <div class="form-group">
              <label>库存数量</label>
              <input 
                type="number" 
                class="form-input" 
                v-model="productForm.inventory" 
                min="0"
              >
              <div class="error-msg" v-if="formErrors.inventory">{{ formErrors.inventory }}</div>
            </div>
          </div>

          <div class="form-group">
            <label>商品分类</label>
            <select class="form-select" v-model="productForm.category">
              <option value="daily">生活用品</option>
              <option value="clothing">环保服饰</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div class="form-group">
            <label>商品图片</label>
            <div class="image-upload-area" v-if="!previewImage">
              <input type="file" id="product-image-upload" accept="image/*" @change="handleFileChange">
              <div class="upload-placeholder">
                <span class="upload-icon">📷</span>
                <span>点击上传商品图片</span>
                <span style="font-size: 0.8rem; opacity: 0.7">(支持 JPG, PNG, GIF，最大 2MB)</span>
              </div>
            </div>
            
            <div class="image-preview" v-else>
              <img :src="previewImage" alt="预览图">
              <button class="preview-remove-btn" @click="removePreview">×</button>
            </div>
            <div class="error-msg" v-if="formErrors.icon">{{ formErrors.icon }}</div>
            <div v-if="!previewImage" style="margin-top: 5px; font-size: 0.8rem; color: #aaa;">* 未上传将使用默认图标 🎁</div>
          </div>

          <div class="form-group">
            <label>商品描述</label>
            <textarea 
              class="form-textarea" 
              v-model="productForm.description" 
              placeholder="请输入商品详细描述..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddProductModal">取消</button>
          <button class="btn-primary" @click="submitProduct" :disabled="isSubmitting">
            {{ isSubmitting ? '处理中...' : '确认上架' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 兑换记录模态框 -->
    <div v-if="showMyOrders" class="modal-overlay" @click.self="showMyOrders = false">
      <div class="modal-content glass-panel">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0;">我的兑换记录</h3>
          <button style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;" @click="showMyOrders = false">×</button>
        </div>
        <div class="order-list" v-if="myOrders.length > 0">
          <div v-for="order in myOrders" :key="order.id" class="order-item">
            <div class="icon">
              <img v-if="order.icon && (order.icon.startsWith('data:image') || order.icon.startsWith('http'))" :src="order.icon" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" alt="icon">
              <span v-else>{{ order.icon && order.icon.length < 50 ? order.icon : '📦' }}</span>
            </div>
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

    <!-- 确认操作模态框 -->
    <div v-if="showConfirmModal" class="modal-overlay" style="z-index: 9999;" @click.self="closeConfirmModal">
      <div class="modal-content glass-panel" style="max-width: 400px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 10px;">
          {{ confirmData.type === 'warning' ? '⚠️' : '🌊' }}
        </div>
        <h3 style="margin-bottom: 15px;">{{ confirmData.title }}</h3>
        <p style="margin-bottom: 25px; color: #eee; line-height: 1.5;">{{ confirmData.message }}</p>
        
        <div class="modal-footer" style="justify-content: center; gap: 15px;">
          <button class="btn-cancel" @click="closeConfirmModal">取消</button>
          <button 
            class="btn-primary" 
            @click="executeConfirmAction"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
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
    store,
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
} from './Mall';

onMounted(() => {
  initMall();
});
</script>

<style scoped src="./Mall.css"></style>