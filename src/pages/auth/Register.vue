<template>
  <div class="min-h-screen bg-ocean-deep flex items-center justify-center p-4 relative overflow-hidden">
    <!-- 背景动画 -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-sea-green/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div class="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-wave-blue/20 rounded-full blur-[100px] animate-pulse-slow" style="animation-delay: 1.5s;"></div>
    </div>

    <div class="relative w-full max-w-md z-10">
      <!-- 注册卡片 -->
      <div class="relative bg-ocean-medium/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
        <!-- 返回首页 -->
        <router-link to="/" class="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>

        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-sea-green to-sea-green-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sea-green/20 transform -rotate-3">
            <span class="text-3xl font-bold text-white">海</span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-wide">加入我们</h1>
          <p class="text-gray-400 mt-2 text-sm">注册成为海洋守护者的一员</p>
        </div>
        
        <!-- 注册表单 -->
        <form @submit.prevent="handleRegister">
          <div class="space-y-5">
            <!-- 用户名 -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-300 mb-1.5 ml-1">用户名</label>
              <input
                type="text"
                id="username"
                v-model="form.username"
                class="w-full px-5 py-3 bg-ocean-dark/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-green/50 focus:border-sea-green/50 text-white placeholder-gray-500 transition-all"
                placeholder="请输入用户名"
                required
              />
            </div>
            
            <!-- 邮箱 -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-1.5 ml-1">邮箱</label>
              <input
                type="email"
                id="email"
                v-model="form.email"
                class="w-full px-5 py-3 bg-ocean-dark/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-green/50 focus:border-sea-green/50 text-white placeholder-gray-500 transition-all"
                placeholder="请输入邮箱"
                required
              />
            </div>
            
            <!-- 密码 -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-300 mb-1.5 ml-1">密码</label>
              <input
                type="password"
                id="password"
                v-model="form.password"
                class="w-full px-5 py-3 bg-ocean-dark/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-green/50 focus:border-sea-green/50 text-white placeholder-gray-500 transition-all"
                placeholder="请输入密码（至少6位）"
                required
                minlength="6"
              />
            </div>
            
            <!-- 确认密码 -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-1.5 ml-1">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="form.confirmPassword"
                class="w-full px-5 py-3 bg-ocean-dark/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-green/50 focus:border-sea-green/50 text-white placeholder-gray-500 transition-all"
                placeholder="请再次输入密码"
                required
                minlength="6"
              />
            </div>
            
            <!-- 角色选择 -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5 ml-1">角色</label>
              <div class="relative">
                <select
                  v-model="form.role"
                  class="w-full px-5 py-3 bg-ocean-dark/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-green/50 focus:border-sea-green/50 text-white appearance-none transition-all cursor-pointer"
                  required
                >
                  <option value="volunteer">普通志愿者</option>
                  <option value="recycle_admin">回收站管理员</option>
                  <option value="system_admin">系统管理员</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- 注册按钮 -->
            <button
              type="submit"
              class="w-full py-3.5 mt-2 bg-gradient-to-r from-sea-green to-sea-green-dark hover:from-sea-green-light hover:to-sea-green text-white font-bold rounded-xl shadow-lg shadow-sea-green/20 hover:shadow-sea-green/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              注 册
            </button>
          </div>
          
          <!-- 登录链接 -->
          <div class="text-center mt-8 pt-6 border-t border-white/5">
            <p class="text-gray-400 text-sm">
              已有账号？ 
              <router-link to="/auth/login" class="text-sea-green font-semibold hover:text-sea-green-light transition-colors ml-1">
                立即登录
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
  email: '',
  password: '',
  confirmPassword: '',
  role: 'volunteer'
})

const handleRegister = () => {
  // 这里将实现注册逻辑
  console.log('注册表单提交:', form.value)
  // 临时跳转到登录页
  router.push('/auth/login')
}
</script>