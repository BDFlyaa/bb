<template>
  <MainLayout>
    <h1 class="text-3xl font-bold mb-6">回收量统计</h1>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-6 mb-8">
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <div class="text-sm text-gray-400 mb-1">总回收量</div>
        <div class="text-3xl font-bold text-sea-green">12,345 kg</div>
        <div class="text-xs text-green-500 mt-2">↑ 12.5% 较上月</div>
      </div>
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <div class="text-sm text-gray-400 mb-1">本月回收量</div>
        <div class="text-3xl font-bold text-sea-green">1,234 kg</div>
        <div class="text-xs text-green-500 mt-2">↑ 8.2% 较上月</div>
      </div>
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <div class="text-sm text-gray-400 mb-1">活跃志愿者</div>
        <div class="text-3xl font-bold text-sea-green">678</div>
        <div class="text-xs text-green-500 mt-2">↑ 5.3% 较上月</div>
      </div>
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <div class="text-sm text-gray-400 mb-1">回收点位</div>
        <div class="text-3xl font-bold text-sea-green">90</div>
        <div class="text-xs text-green-500 mt-2">↑ 3.4% 较上月</div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="grid grid-cols-2 gap-6">
      <!-- 回收趋势图 -->
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <h2 class="text-xl font-semibold mb-4">回收趋势</h2>
        <div class="h-[300px] bg-ocean-deep rounded-lg p-4 flex items-center justify-center">
          <div class="text-gray-400">ECharts 回收趋势图</div>
        </div>
      </div>
      
      <!-- 垃圾类型分布 -->
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <h2 class="text-xl font-semibold mb-4">垃圾类型分布</h2>
        <div class="h-[300px] bg-ocean-deep rounded-lg p-4 flex items-center justify-center">
          <div class="text-gray-400">ECharts 垃圾类型分布图</div>
        </div>
      </div>
      
      <!-- 城市排行榜 -->
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50 col-span-2">
        <h2 class="text-xl font-semibold mb-4">城市回收排行榜</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-ocean-deep/50">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-300">排名</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-300">城市</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-300">回收量 (kg)</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-300">志愿者人数</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-300">回收点位</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(city, index) in cities" :key="city.id" class="border-b border-ocean-deep/50 hover:bg-ocean-deep/20 transition-colors">
                <td class="py-3 px-4 text-sm">
                  <span class="font-bold text-sea-green">{{ index + 1 }}</span>
                </td>
                <td class="py-3 px-4 text-sm">{{ city.name }}</td>
                <td class="py-3 px-4 text-sm">{{ city.recycled }}</td>
                <td class="py-3 px-4 text-sm">{{ city.volunteers }}</td>
                <td class="py-3 px-4 text-sm">{{ city.points }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'

// 城市排行数据
const cities = ref([
  { id: 1, name: '上海', recycled: '3,456 kg', volunteers: 123, points: 23 },
  { id: 2, name: '北京', recycled: '2,345 kg', volunteers: 98, points: 18 },
  { id: 3, name: '广州', recycled: '1,987 kg', volunteers: 87, points: 15 },
  { id: 4, name: '深圳', recycled: '1,765 kg', volunteers: 76, points: 12 },
  { id: 5, name: '杭州', recycled: '1,543 kg', volunteers: 65, points: 10 }
])
</script>
