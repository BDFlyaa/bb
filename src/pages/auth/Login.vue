<template>
  <div class="min-h-screen bg-ocean-deep flex items-center justify-center p-4 relative overflow-hidden">
    <!-- 背景动画 -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-sea-green/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div class="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-wave-blue/20 rounded-full blur-[100px] animate-pulse-slow" style="animation-delay: 1s;"></div>
    </div>

    <div class="relative w-full max-w-md z-10">
      <!-- 登录卡片 -->
      <div class="relative bg-ocean-medium/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
        <!-- 返回首页 -->
        <router-link to="/" class="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>

        <div class="text-center mb-10">
          <div class="w-20 h-20 bg-gradient-to-br from-sea-green to-sea-green-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sea-green/20 transform rotate-3">
            <span class="text-4xl font-bold text-white">海</span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-wide">欢迎回来</h1>
          <p class="text-gray-400 mt-3 text-sm">登录以继续您的环保之旅</p>
        </div>
        
        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin">
          <div class="space-y-6">
            <!-- 用户名/邮箱 -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-300 mb-2 ml-1">用户名或邮箱</label>
              <div class="relative">
                <input
                  type="text"
                  id="username"
                  v-model="form.username"
                  class="w-full px-5 py-3.5 bg-ocean-dark/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-green/50 focus:border-sea-green/50 text-white placeholder-gray-500 transition-all"
                  placeholder="请输入用户名或邮箱"
                  required
                />
              </div>
            </div>
            
            <!-- 密码 -->
            <div>
              <div class="flex justify-between items-center mb-2 ml-1">
                <label for="password" class="block text-sm font-medium text-gray-300">密码</label>
                <a href="#" class="text-xs text-sea-green hover:text-sea-green-light transition-colors">忘记密码？</a>
              </div>
              <input
                type="password"
                id="password"
                v-model="form.password"
                class="w-full px-5 py-3.5 bg-ocean-dark/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-green/50 focus:border-sea-green/50 text-white placeholder-gray-500 transition-all"
                placeholder="请输入密码"
                required
              />
            </div>
            
            <!-- 记住我 -->
            <div class="flex items-center ml-1">
              <input
                type="checkbox"
                id="remember"
                v-model="form.remember"
                class="w-4 h-4 bg-ocean-dark border border-white/10 rounded focus:ring-sea-green text-sea-green"
              />
              <label for="remember" class="ml-2 text-sm text-gray-400">记住我</label>
            </div>
            
            <!-- 登录按钮 -->
            <button
              type="submit"
              class="w-full py-3.5 bg-gradient-to-r from-sea-green to-sea-green-dark hover:from-sea-green-light hover:to-sea-green text-white font-bold rounded-xl shadow-lg shadow-sea-green/20 hover:shadow-sea-green/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              登 录
            </button>
          </div>
          
          <!-- 注册链接 -->
          <div class="text-center mt-8 pt-6 border-t border-white/5">
            <p class="text-gray-400 text-sm">
              还没有账号？ 
              <router-link to="/auth/register" class="text-sea-green font-semibold hover:text-sea-green-light transition-colors ml-1">
                立即注册
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  username: '',
  password: '',
  remember: false
})

const handleLogin = () => {
  // 这里将实现登录逻辑
  console.log('登录表单提交:', form.value)
  // 临时跳转到首页
  router.push('/')
}
</script>
