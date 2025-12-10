<template>
  <MainLayout>
    <h1 class="text-3xl font-bold mb-6">积分商城</h1>
    
    <!-- 用户积分信息 -->
    <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50 mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">我的积分</h2>
          <p class="text-gray-400 mt-1">可用于兑换海洋主题周边、树木认领、公益证书等</p>
        </div>
        <div class="text-3xl font-bold text-sea-green">12,345 积分</div>
      </div>
    </div>
    
    <!-- 商品分类 -->
    <div class="mb-8">
      <div class="flex space-x-4 overflow-x-auto pb-4">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="px-6 py-2 rounded-full whitespace-nowrap bg-ocean-light hover:bg-ocean-deep transition-colors"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
    
    <!-- 商品列表 -->
    <div class="grid grid-cols-4 gap-6">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="bg-ocean-light rounded-xl overflow-hidden border border-ocean-deep/50 hover:border-sea-green/50 transition-colors"
      >
        <!-- 商品图片 -->
        <div class="h-48 bg-ocean-deep flex items-center justify-center">
          <div class="text-6xl">{{ product.icon }}</div>
        </div>
        
        <!-- 商品信息 -->
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1">{{ product.name }}</h3>
          <p class="text-sm text-gray-400 mb-3">{{ product.description }}</p>
          
          <div class="flex items-center justify-between">
            <div class="text-sea-green font-bold">{{ product.points }} 积分</div>
            <button class="px-4 py-2 bg-sea-green hover:bg-sea-green/80 text-white rounded-lg text-sm transition-colors">
              立即兑换
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'

// 商品分类
const categories = ref([
  { id: 1, name: '全部' },
  { id: 2, name: '海洋周边' },
  { id: 3, name: '树木认领' },
  { id: 4, name: '公益证书' },
  { id: 5, name: '环保工具' }
])

// 商品列表
const products = ref([
  { id: 1, name: '海洋主题T恤', description: '环保材质制作，印有海洋生物图案', points: 1, icon: '👕' },
  { id: 2, name: '塑料瓶回收袋', description: '可重复使用的环保回收袋', points: 200, icon: '🛍️' },
  { id: 3, name: '海洋保护证书', description: '电子证书，记录您的环保贡献', points: 500, icon: '📜' },
  { id: 4, name: '树木认领', description: '认领一棵树苗，我们将为您种植', points: 1, icon: '🌳' },
  { id: 5, name: '环保水杯', description: '不锈钢材质，减少塑料瓶使用', points: 800, icon: '🥤' },
  { id: 6, name: '海洋科普书籍', description: '介绍海洋塑料污染及保护知识', points: 1, icon: '📚' },
  { id: 7, name: '环保帆布袋', description: '大容量帆布袋，替代塑料袋', points: 300, icon: '👜' },
  { id: 8, name: '志愿者勋章', description: '金属材质勋章，表彰您的志愿者贡献', points: 1, icon: '🏅' }
])
</script>
