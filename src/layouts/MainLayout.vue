<template>
  <div class="flex flex-col min-h-screen bg-ocean-deep text-white font-sans">
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
            <template v-for="item in navItems" :key="item.path">
              <div v-if="item.name === '帮助与支持'" class="relative" @mouseenter="isHelpDropdownOpen = true" @mouseleave="isHelpDropdownOpen = false">
                <button class="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200">
                  {{ item.name }} <span class="ml-1">▼</span>
                </button>
                <div v-if="isHelpDropdownOpen" class="absolute left-0 mt-2 w-48 bg-ocean-medium rounded-md shadow-lg z-20">
                  <router-link to="/faq" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">常见问题</router-link>
                  <router-link to="/volunteer-guide" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">志愿者指南</router-link>
                  <router-link to="/privacy-policy" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">隐私政策</router-link>
                  <router-link to="/terms-of-service" class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">服务条款</router-link>
                </div>
              </div>
              <router-link 
                v-else
                :to="item.path" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                active-class="text-sea-green bg-sea-green/10"
              >
                {{ item.name }}
              </router-link>
            </template>
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
    <main class="flex-grow flex flex-col">
      <slot></slot>
    </main>
    
    <!-- 页脚 -->
    <footer :class="['bg-ocean-dark border-t border-white/5', route.path === '/' ? 'pt-16 pb-8' : 'py-6']">
      <div class="container mx-auto px-4">
        <div v-if="route.path === '/'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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
        
        <div :class="['flex flex-col md:flex-row items-center justify-between', route.path === '/' ? 'border-t border-white/5 pt-8' : '']">
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
import { useRoute } from 'vue-router'

const route = useRoute()
const isHelpDropdownOpen = ref(false)

const navItems = [
  { name: '首页', path: '/' },
  { name: '回收地图', path: '/map' },
  { name: '志愿者打卡', path: '/checkin' },
  { name: '区块链溯源', path: '/blockchain' },
  { name: '数据统计', path: '/stats' },
  { name: '积分商城', path: '/mall' },
  { name: '科普专区', path: '/science' },
  { name: '志愿者社区', path: '/community' },
  { name: '帮助与支持', path: '/help' },
]
</script>
