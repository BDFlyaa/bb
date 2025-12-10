<template>
  <MainLayout>
    <h1 class="text-3xl font-bold mb-6">海洋塑料知识科普</h1>
    
    <!-- 科普分类 -->
    <div class="mb-8">
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50 hover:border-sea-green/50 transition-colors cursor-pointer">
          <div class="text-4xl mb-4">📖</div>
          <h3 class="text-xl font-semibold mb-2">图文科普</h3>
          <p class="text-gray-400">了解海洋塑料污染的危害和解决方案</p>
        </div>
        <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50 hover:border-sea-green/50 transition-colors cursor-pointer">
          <div class="text-4xl mb-4">🎬</div>
          <h3 class="text-xl font-semibold mb-2">短视频</h3>
          <p class="text-gray-400">观看海洋保护相关短视频</p>
        </div>
        <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50 hover:border-sea-green/50 transition-colors cursor-pointer">
          <div class="text-4xl mb-4">🎮</div>
          <h3 class="text-xl font-semibold mb-2">互动H5</h3>
          <p class="text-gray-400">参与互动游戏，学习海洋保护知识</p>
        </div>
      </div>
    </div>
    
    <!-- 热门科普内容 -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">热门科普内容</h2>
      <div class="grid grid-cols-3 gap-6">
        <!-- 图文内容 -->
        <div class="bg-ocean-light rounded-xl overflow-hidden border border-ocean-deep/50">
          <div class="h-48 bg-ocean-deep flex items-center justify-center">
            <div class="text-6xl">🌊</div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-2">海洋塑料污染的危害</h3>
            <p class="text-sm text-gray-400 mb-3">了解海洋塑料污染对海洋生物和人类的危害</p>
            <a href="#" class="text-sea-green hover:underline text-sm">阅读全文 →</a>
          </div>
        </div>
        
        <!-- 视频内容 -->
        <div class="bg-ocean-light rounded-xl overflow-hidden border border-ocean-deep/50">
          <div class="h-48 bg-ocean-deep flex items-center justify-center">
            <div class="text-6xl">🎥</div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-2">塑料回收的正确方式</h3>
            <p class="text-sm text-gray-400 mb-3">学习如何正确分类和回收塑料垃圾</p>
            <a href="#" class="text-sea-green hover:underline text-sm">观看视频 →</a>
          </div>
        </div>
        
        <!-- 互动H5 -->
        <div class="bg-ocean-light rounded-xl overflow-hidden border border-ocean-deep/50">
          <div class="h-48 bg-ocean-deep flex items-center justify-center">
            <div class="text-6xl">🎯</div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-2">海洋保护小测试</h3>
            <p class="text-sm text-gray-400 mb-3">测试你的海洋保护知识水平</p>
            <a href="#" class="text-sea-green hover:underline text-sm">开始测试 →</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最新资讯 -->
    <div>
      <h2 class="text-2xl font-semibold mb-4">最新资讯</h2>
      <div class="space-y-4">
        <div class="bg-ocean-light rounded-xl p-4 border border-ocean-deep/50 hover:border-sea-green/50 transition-colors cursor-pointer">
          <div class="flex items-start">
            <div class="text-3xl mr-4">📰</div>
            <div>
              <h3 class="font-semibold">科学家发现新的海洋塑料降解方法</h3>
              <p class="text-sm text-gray-400 mt-1">2025-12-01</p>
            </div>
          </div>
        </div>
        <div class="bg-ocean-light rounded-xl p-4 border border-ocean-deep/50 hover:border-sea-green/50 transition-colors cursor-pointer">
          <div class="flex items-start">
            <div class="text-3xl mr-4">🌍</div>
            <div>
              <h3 class="font-semibold">全球海洋塑料回收行动取得新进展</h3>
              <p class="text-sm text-gray-400 mt-1">2025-11-28</p>
            </div>
          </div>
        </div>
        <div class="bg-ocean-light rounded-xl p-4 border border-ocean-deep/50 hover:border-sea-green/50 transition-colors cursor-pointer">
          <div class="flex items-start">
            <div class="text-3xl mr-4">🐠</div>
            <div>
              <h3 class="font-semibold">海洋生物保护组织呼吁减少塑料使用</h3>
              <p class="text-sm text-gray-400 mt-1">2025-11-25</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../../layouts/MainLayout.vue'
</script>
