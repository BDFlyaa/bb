<template>
  <div class="min-h-screen bg-ocean-deep text-white font-sans">
    <!-- 导航栏 -->
    <header class="bg-ocean-medium/80 backdrop-blur-md sticky top-0 left-0 right-0 z-50 border-b border-white/5">
      <nav class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 bg-gradient-to-br from-sea-green to-sea-green-dark rounded-xl flex items-center justify-center shadow-lg shadow-sea-green/20 group-hover:shadow-sea-green/40 transition-all duration-300">
              <span class="text-xl font-bold text-white relative z-10">海</span>
            </div>
            <h1 class="text-xl font-bold text-white tracking-wide">海洋塑料回收</h1>
          </router-link>
          
          <!-- 桌面导航 -->
          <div class="flex items-center space-x-1">
            <router-link 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path" 
              class="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              active-class="text-sea-green bg-sea-green/10"
            >
              {{ item.name }}
            </router-link>
          </div>
          
          <!-- 右侧按钮组 -->
          <div class="flex items-center space-x-4">
            <router-link to="/auth/login" class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">登录</router-link>
            <router-link to="/auth/register" class="px-4 py-2 rounded-lg bg-sea-green hover:bg-sea-green-dark text-white text-sm font-medium shadow-lg shadow-sea-green/20 hover:shadow-sea-green/40 transition-all duration-300 transform hover:-translate-y-0.5">注册</router-link>
          </div>
        </div>
      </nav>
    </header>
    
    <!-- 主内容区 -->
    <main class="min-h-screen flex flex-col">
      <slot></slot>
    </main>
    
    <!-- 页脚 -->
    <footer class="bg-ocean-dark border-t border-white/5 pt-16 pb-8">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <!-- 品牌信息 -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-sea-green to-sea-green-dark rounded-full flex items-center justify-center">
                <span class="text-sm font-bold text-white">海</span>
              </div>
              <h2 class="text-lg font-bold text-white">海洋塑料回收</h2>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              利用区块链与 AI 技术，构建透明、高效的海洋塑料回收生态系统。让我们携手守护蓝色星球。
            </p>
          </div>
          
          <!-- 快速链接 -->
          <div>
            <h3 class="text-white font-semibold mb-6">平台功能</h3>
            <ul class="space-y-3">
              <li><router-link to="/map" class="text-gray-400 hover:text-sea-green transition-colors text-sm">回收点地图</router-link></li>
              <li><router-link to="/checkin" class="text-gray-400 hover:text-sea-green transition-colors text-sm">智能识别打卡</router-link></li>
              <li><router-link to="/blockchain" class="text-gray-400 hover:text-sea-green transition-colors text-sm">区块链溯源</router-link></li>
              <li><router-link to="/mall" class="text-gray-400 hover:text-sea-green transition-colors text-sm">绿色积分商城</router-link></li>
            </ul>
          </div>
          
          <!-- 帮助支持 -->
          <div>
            <h3 class="text-white font-semibold mb-6">帮助与支持</h3>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-sea-green transition-colors text-sm">常见问题</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sea-green transition-colors text-sm">志愿者指南</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sea-green transition-colors text-sm">隐私政策</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sea-green transition-colors text-sm">服务条款</a></li>
            </ul>
          </div>
          
          <!-- 订阅/关注 -->
          <div>
            <h3 class="text-white font-semibold mb-6">关注我们</h3>
            <div class="flex space-x-4">
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-sea-green hover:text-white transition-all duration-300">
                <span class="text-lg">📱</span>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-sea-green hover:text-white transition-all duration-300">
                <span class="text-lg">💬</span>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-sea-green hover:text-white transition-all duration-300">
                <span class="text-lg">📧</span>
              </a>
            </div>
          </div>
        </div>
        
        <div class="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p class="text-gray-500 text-sm">© 2025 海洋塑料回收公益项目. All rights reserved.</p>
          <div class="mt-4 md:mt-0 flex space-x-6">
            <span class="text-gray-600 text-sm">Designed for Earth</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const navItems = [
  { name: '首页', path: '/' },
  { name: '回收地图', path: '/map' },
  { name: '志愿者打卡', path: '/checkin' },
  { name: '区块链溯源', path: '/blockchain' },
  { name: '数据统计', path: '/stats' },
  { name: '积分商城', path: '/mall' },
  { name: '科普专区', path: '/science' },
  { name: '志愿者社区', path: '/community' },
]
</script>
