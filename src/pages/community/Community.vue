<template>
  <MainLayout>
    <h1 class="text-3xl font-bold mb-6">志愿者社区</h1>
    
    <!-- 社区导航 -->
    <div class="mb-8">
      <div class="flex space-x-4 overflow-x-auto pb-4">
        <button class="px-6 py-2 rounded-full whitespace-nowrap bg-sea-green text-white font-semibold">动态</button>
        <button class="px-6 py-2 rounded-full whitespace-nowrap bg-ocean-light hover:bg-ocean-deep transition-colors">任务广场</button>
        <button class="px-6 py-2 rounded-full whitespace-nowrap bg-ocean-light hover:bg-ocean-deep transition-colors">组队捡拾</button>
        <button class="px-6 py-2 rounded-full whitespace-nowrap bg-ocean-light hover:bg-ocean-deep transition-colors">排行榜</button>
      </div>
    </div>
    
    <!-- 发布动态 -->
    <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50 mb-8">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-ocean-deep rounded-full flex items-center justify-center">
          <span class="text-lg font-bold">用</span>
        </div>
        <div class="flex-1">
          <textarea 
            placeholder="分享你的回收故事..." 
            class="w-full px-4 py-3 bg-ocean-deep border border-ocean-deep/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-green text-white resize-none h-20"
          ></textarea>
          <div class="flex items-center justify-end mt-3 space-x-3">
            <button class="px-4 py-2 bg-ocean-deep hover:bg-ocean-deep/80 text-white rounded-lg text-sm transition-colors">
              📸 上传图片
            </button>
            <button class="px-4 py-2 bg-sea-green hover:bg-sea-green/80 text-white rounded-lg text-sm transition-colors">
              发布
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 动态列表 -->
    <div class="space-y-6">
      <!-- 动态项 -->
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <!-- 动态头部 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-ocean-deep rounded-full flex items-center justify-center">
              <span class="text-base font-bold">志</span>
            </div>
            <div>
              <div class="font-medium">志愿者A</div>
              <div class="text-xs text-gray-400">2小时前</div>
            </div>
          </div>
          <button class="text-gray-400 hover:text-white">
            ⋮
          </button>
        </div>
        
        <!-- 动态内容 -->
        <div class="mb-4">
          <p>今天在海边捡了很多塑料瓶，保护海洋环境，从我做起！🌊</p>
        </div>
        
        <!-- 动态图片 -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-ocean-deep rounded-lg h-32 flex items-center justify-center">
            <div class="text-3xl">🌊</div>
          </div>
          <div class="bg-ocean-deep rounded-lg h-32 flex items-center justify-center">
            <div class="text-3xl">🐚</div>
          </div>
        </div>
        
        <!-- 动态互动 -->
        <div class="flex items-center justify-between pt-3 border-t border-ocean-deep/50">
          <div class="flex items-center space-x-6">
            <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
              <span>❤️</span>
              <span>123</span>
            </button>
            <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
              <span>💬</span>
              <span>45</span>
            </button>
            <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
              <span>🔄</span>
              <span>67</span>
            </button>
          </div>
          <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
            <span>📌</span>
            <span>收藏</span>
          </button>
        </div>
      </div>
      
      <!-- 动态项 -->
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <!-- 动态头部 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-ocean-deep rounded-full flex items-center justify-center">
              <span class="text-base font-bold">愿</span>
            </div>
            <div>
              <div class="font-medium">志愿者B</div>
              <div class="text-xs text-gray-400">5小时前</div>
            </div>
          </div>
          <button class="text-gray-400 hover:text-white">
            ⋮
          </button>
        </div>
        
        <!-- 动态内容 -->
        <div class="mb-4">
          <p>参加了社区组织的塑料回收活动，收获满满！💪</p>
        </div>
        
        <!-- 动态互动 -->
        <div class="flex items-center justify-between pt-3 border-t border-ocean-deep/50">
          <div class="flex items-center space-x-6">
            <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
              <span>❤️</span>
              <span>89</span>
            </button>
            <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
              <span>💬</span>
              <span>23</span>
            </button>
            <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
              <span>🔄</span>
              <span>45</span>
            </button>
          </div>
          <button class="flex items-center space-x-2 text-gray-400 hover:text-sea-green transition-colors">
            <span>📌</span>
            <span>收藏</span>
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../../layouts/MainLayout.vue'
</script>
