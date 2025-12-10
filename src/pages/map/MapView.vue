<template>
  <MainLayout>
    <h1 class="text-3xl font-bold mb-6">回收点地图</h1>
    
    <div class="grid grid-cols-1 grid-cols-4 gap-6">
      <!-- 左侧搜索和筛选 -->
      <div class="col-span-1">
        <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
          <h2 class="text-xl font-semibold mb-4">搜索回收点</h2>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="请输入地址或回收点名称" 
            class="w-full px-4 py-3 bg-ocean-deep border border-ocean-deep/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-green text-white mb-4"
          >
          <button class="w-full bg-sea-green hover:bg-sea-green/80 text-white font-semibold py-3 rounded-lg transition-colors mb-6">
            搜索
          </button>
          
          <h3 class="text-lg font-medium mb-3">筛选</h3>
          <div class="space-y-3">
            <label class="flex items-center">
              <input type="checkbox" class="mr-2">
              <span>可回收塑料</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" class="mr-2">
              <span>可回收玻璃</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" class="mr-2">
              <span>可回收金属</span>
            </label>
          </div>
          
          <button class="w-full bg-ocean-deep hover:bg-ocean-deep/80 text-white font-semibold py-3 rounded-lg transition-colors mt-6">
            申报新回收点
          </button>
        </div>
      </div>
      
      <!-- 右侧地图 -->
      <div class="col-span-3">
        <div class="bg-ocean-light rounded-xl border border-ocean-deep/50 overflow-hidden">
          <div id="map-container" class="w-full h-[500px]"></div>
        </div>
        
        <!-- 回收点列表 -->
        <div class="mt-6">
          <h2 class="text-xl font-semibold mb-4">附近回收点</h2>
          <div class="grid grid-cols-1 grid-cols-2 gap-4">
            <div 
              v-for="point in recyclingPoints" 
              :key="point.id" 
              class="bg-ocean-light rounded-xl p-4 border border-ocean-deep/50 hover:border-sea-green/50 transition-colors cursor-pointer"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-lg">{{ point.name }}</h3>
                  <p class="text-gray-400 text-sm mt-1">{{ point.address }}</p>
                  <div class="flex items-center mt-2 text-sm">
                    <span class="text-sea-green mr-2">📍</span>
                    <span>{{ point.distance }}km</span>
                  </div>
                </div>
                <button class="px-3 py-1 bg-sea-green/20 text-sea-green rounded-full text-sm">
                  导航
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'

const searchQuery = ref('')

// 模拟回收点数据
const recyclingPoints = ref([
  { id: 1, name: '海洋回收点-1', address: '上海市浦东新区张江高科技园区', distance: 1.2 },
  { id: 2, name: '海洋回收点-2', address: '上海市浦东新区陆家嘴金融中心', distance: 2.5 },
  { id: 3, name: '海洋回收点-3', address: '上海市徐汇区徐家汇商圈', distance: 3.8 },
  { id: 4, name: '海洋回收点-4', address: '上海市静安区南京西路', distance: 4.1 },
])

onMounted(() => {
  // 这里将初始化高德地图
  console.log('初始化高德地图')
  // 实际开发中，这里会集成高德地图API
})
</script>
