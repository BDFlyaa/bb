<template>
  <div class="mall-view">
    <!-- 志愿者视图 -->
    <div v-if="!isAdmin">
      <div class="header-section">
        <div class="title-area">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 8px;"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
            积分商城
          </h2>
          <p>用您的环保贡献换取精美礼品</p>
        </div>
        <div class="user-status glass-panel">
          <span class="label">我的积分</span>
          <span class="value">
            {{ store.user.points || 0 }} 
            <svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 2px;"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="2"></line></svg>
          </span>
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
              <span class="points">
                {{ item.points }} 
                <svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 2px;"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="2"></line></svg>
              </span>
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
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 8px;"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            商城运维中心
          </h2>
          <div class="admin-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'products' }]" 
              @click="activeTab = 'products'"
            >
              <span class="tab-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </span>
              商品管理
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'orders' }]" 
              @click="activeTab = 'orders'"
            >
              <span class="tab-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </span>
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
                <button class="btn-sm btn-info" @click="editProduct(item)">修改价格</button>
                <button 
                  :class="['btn-sm', item.status === 'inactive' ? 'btn-success' : 'btn-warning']" 
                  @click="toggleStatus(item)"
                >
                  {{ item.status === 'inactive' ? '上架' : '下架' }}
                </button>
                <button class="btn-sm btn-danger" @click="deleteProduct(item)">删除</button>
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
                <button class="btn-sm btn-info" @click="viewOrderDetails(order)">详情</button>
                <button v-if="order.status === 'pending'" class="btn-sm btn-success" @click="shipOrder(order)">发货</button>
                <button v-if="order.status === 'pending'" class="btn-sm btn-danger" @click="cancelOrder(order)">取消</button>
                <button v-if="order.status === 'shipped'" class="btn-sm btn-warning" @click="unshipOrder(order)">取消发货</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 订单详情模态框 -->
    <div v-if="showOrderDetailsModal" class="modal-overlay" style="z-index: 10000;" @click.self="closeOrderDetailsModal">
      <div class="modal-content glass-panel">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            订单详情
          </h3>
          <button style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;" @click="closeOrderDetailsModal">×</button>
        </div>
        
        <div class="modal-body" v-if="currentOrder">
          <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 15px; font-size: 0.95rem;">
              <div style="color: #888;">订单编号</div>
              <div>{{ currentOrder.id }}</div>
              
              <div style="color: #888;">下单时间</div>
              <div>{{ currentOrder.time }}</div>
              
              <div style="color: #888;">当前状态</div>
              <div>
                <span :class="['status-tag', currentOrder.status]">{{ currentOrder.statusText }}</span>
              </div>
              
              <div style="color: #888;">兑换商品</div>
              <div>{{ currentOrder.item }}</div>
              
              <div style="color: #888;">兑换用户</div>
              <div>{{ currentOrder.user }}</div>
            </div>
          </div>

          <h4 style="margin-bottom: 15px; border-left: 3px solid #00e5ff; padding-left: 10px;">收货信息</h4>
          <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 15px; font-size: 0.95rem;">
              <div style="color: #888;">联系电话</div>
              <div>{{ currentOrder.phone || '暂无' }}</div>
              
              <div style="color: #888;">收货地址</div>
              <div style="line-height: 1.5;">{{ currentOrder.address || '暂无' }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="closeOrderDetailsModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 添加商品模态框 -->
    <div v-if="showAddProductModal" class="modal-overlay" @click.self="closeAddProductModal">
      <div class="modal-content glass-panel">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            上架新商品
          </h3>
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
                <span class="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </span>
                <span>点击上传商品图片</span>
                <span style="font-size: 0.8rem; opacity: 0.7">(支持 JPG, PNG, GIF，最大 2MB)</span>
              </div>
            </div>
            
            <div class="image-preview" v-else>
              <img :src="previewImage" alt="预览图">
              <button class="preview-remove-btn" @click="removePreview">×</button>
            </div>
            <div class="error-msg" v-if="formErrors.icon">{{ formErrors.icon }}</div>
            <div v-if="!previewImage" style="margin-top: 5px; font-size: 0.8rem; color: #aaa;">* 未上传将使用默认图标</div>
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
          <table class="my-orders-table">
            <thead>
              <tr>
                <th>商品信息</th>
                <th>兑换时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in myOrders" :key="order.id">
                <td>
                  <div class="product-info-cell">
                    <div class="icon">
                      <img v-if="order.icon && (order.icon.startsWith('data:image') || order.icon.startsWith('http'))" :src="order.icon" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" alt="icon">
                      <span v-else>{{ order.icon && order.icon.length < 50 ? order.icon : '📦' }}</span>
                    </div>
                    <span class="name">{{ order.name }}</span>
                  </div>
                </td>
                <td>{{ order.time }}</td>
                <td><span class="status success">兑换成功</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <p>暂无兑换记录</p>
        </div>
      </div>
    </div>

    <!-- 修改商品价格模态框 -->
    <div v-if="showEditProductModal" class="modal-overlay" @click.self="closeEditProductModal">
      <div class="modal-content glass-panel">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            修改商品信息
          </h3>
          <button style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;" @click="closeEditProductModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>商品名称</label>
            <input 
              type="text" 
              class="form-input" 
              v-model="editProductForm.name" 
              disabled
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>积分价格</label>
              <input 
                type="number" 
                class="form-input" 
                v-model="editProductForm.points" 
                min="1"
              >
              <div class="error-msg" v-if="editFormErrors.points">{{ editFormErrors.points }}</div>
            </div>
            
            <div class="form-group">
              <label>库存数量</label>
              <input 
                type="number" 
                class="form-input" 
                v-model="editProductForm.inventory" 
                min="0"
              >
              <div class="error-msg" v-if="editFormErrors.inventory">{{ editFormErrors.inventory }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditProductModal">取消</button>
          <button class="btn-primary" @click="submitEditProduct" :disabled="isSubmitting">
            {{ isSubmitting ? '处理中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 兑换商品模态框 -->
    <div v-if="showRedeemModal" class="modal-overlay" style="z-index: 10000;" @click.self="closeRedeemModal">
      <div class="modal-content glass-panel">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            兑换商品
          </h3>
          <button style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;" @click="closeRedeemModal">×</button>
        </div>
        
        <div class="modal-body" v-if="currentRedeemItem">
          <!-- 商品信息概览 -->
          <div style="display: flex; gap: 15px; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 25px; align-items: center;">
            <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
              <img v-if="currentRedeemItem.icon && (currentRedeemItem.icon.startsWith('data:image') || currentRedeemItem.icon.startsWith('http'))" :src="currentRedeemItem.icon" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="商品图片">
              <span v-else>{{ currentRedeemItem.icon }}</span>
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 5px 0;">{{ currentRedeemItem.name }}</h4>
              <div style="color: #ffd700; font-weight: bold;">
                {{ currentRedeemItem.points }} 积分
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>收货人姓名</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="redeemForm.name" 
                placeholder="请输入收货人姓名"
              >
              <div class="error-msg" v-if="redeemFormErrors.name">{{ redeemFormErrors.name }}</div>
            </div>
            
            <div class="form-group">
              <label>联系电话</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="redeemForm.phone" 
                placeholder="请输入联系电话"
              >
              <div class="error-msg" v-if="redeemFormErrors.phone">{{ redeemFormErrors.phone }}</div>
            </div>
          </div>

          <div class="form-group">
            <label>详细收货地址</label>
            <textarea 
              class="form-textarea" 
              v-model="redeemForm.address" 
              placeholder="请输入省、市、区、街道及详细门牌号"
              style="min-height: 80px;"
            ></textarea>
            <div class="error-msg" v-if="redeemFormErrors.address">{{ redeemFormErrors.address }}</div>
          </div>

          <!-- 积分计算 -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.9rem; color: #aaa; display: flex; justify-content: space-between;">
            <span>当前积分：{{ store.user.points || 0 }}</span>
            <span style="color: #00e5ff;">兑换后剩余：{{ (store.user.points || 0) - currentRedeemItem.points }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeRedeemModal">取消</button>
          <button class="btn-primary" @click="submitRedeem" :disabled="isSubmitting">
            {{ isSubmitting ? '处理中...' : '确认兑换' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 确认操作模态框 -->
    <div v-if="showConfirmModal" class="modal-overlay" style="z-index: 9999;" @click.self="closeConfirmModal">
      <div class="modal-content glass-panel" style="max-width: 400px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 10px; display: flex; justify-content: center;">
          <svg v-if="confirmData.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ffcc00;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #00b4db;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
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

    <!-- 兑换成功模态框 -->
    <div v-if="showRedeemSuccessModal" class="modal-overlay" style="z-index: 10000;" @click.self="closeRedeemSuccessModal">
      <div class="modal-content glass-panel" style="max-width: 400px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 10px; display: flex; justify-content: center; color: #52c41a;">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h3 style="margin-bottom: 15px;">兑换成功</h3>
        <p style="margin-bottom: 25px; color: #eee; line-height: 1.5;">{{ redeemSuccessMessage }}</p>
        
        <div class="modal-footer" style="justify-content: center;">
          <button class="btn-primary" @click="closeRedeemSuccessModal">确定</button>
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
} from './Mall';

onMounted(() => {
  initMall();
});
</script>

<style scoped src="./Mall.css"></style>