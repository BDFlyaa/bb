<template>
  <MainLayout>
    <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#004e92] to-[#006994]">
      
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div v-for="n in 15" :key="n" class="bubble absolute rounded-full bg-white/20 backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.3)]" :style="getBubbleStyle()"></div>
      </div>

      <div class="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
        <WaveBackground />
      </div>

      <div class="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg animate-fade-in-up">
          守护蔚蓝<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#4facfe] to-[#00f2fe]">变废为宝</span>
        </h1>
        
        <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up delay-100">
          每年有 800 万吨塑料流入海洋。<br class="md:hidden">我们要做的不仅仅是清洁，而是赋予它们新的生命。
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-200">
          <router-link to="/auth/register" class="btn-primary large">
            立即加入
          </router-link>
          
          <router-link to="/map" class="btn-secondary">
            探索地图
          </router-link>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full leading-none z-20">
        <svg class="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-[#f9fbfd]"></path>
        </svg>
      </div>
    </section>

    <section class="relative bg-[#f9fbfd] pt-12 pb-24 px-4 z-20">
      <div class="container mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-[#004e92] mb-4">我们的影响力</h2>
          <div class="w-20 h-1 bg-[#00b4db] mx-auto rounded-full"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,78,146,0.08)] hover:-translate-y-2 transition-transform duration-300 border border-blue-50 text-center group">
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{{ stat.icon }}</div>
            <div class="text-2xl md:text-3xl font-extrabold text-[#006994] mb-1 font-mono">{{ stat.value }}</div>
            <div class="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wide">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative py-20 bg-gradient-to-b from-[#e0f7fa] to-white">
      <div class="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg class="relative block w-[calc(100%+1.3px)] h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-[#f9fbfd]"></path>
        </svg>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-[#004e92] mb-4">开启回收之旅</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">利用区块链技术与 AI 识别，让每一次环保行动都可追溯。</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          <router-link 
            v-for="feature in features" 
            :key="feature.title" 
            :to="feature.link"
            class="group relative flex flex-row items-center justify-start px-6 py-4 rounded-full transition-all duration-300 overflow-hidden bg-white shadow-sm hover:shadow-lg border border-blue-50 hover:-translate-y-1"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-[#00b4db] to-[#0083b0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative z-10 flex items-center gap-4 w-full">
              <div class="w-12 h-12 flex-shrink-0 rounded-full bg-[#f0f9ff] text-[#0083b0] flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                <component :is="feature.icon" class="w-6 h-6" />
              </div>
              
              <div class="flex flex-col text-left">
                <span class="font-bold text-gray-700 text-base group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                  {{ feature.title }}
                </span>
                <span class="text-xs text-gray-400 group-hover:text-blue-100 transition-colors duration-300 font-light">
                  点击进入
                </span>
              </div>

              <div class="ml-auto text-gray-300 group-hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <section class="relative py-20 text-center overflow-hidden">
      <div class="absolute inset-0 bg-blue-50/50 -z-10"></div>
      <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-[#00b4db]/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-20 top-10 w-40 h-40 bg-[#004e92]/5 rounded-full blur-2xl"></div>

      <div class="container mx-auto px-4">
        <h3 class="text-2xl font-bold text-gray-800 mb-2">准备好改变世界了吗？</h3>
        <p class="text-gray-500 mb-8">加入我们的行列，让每一次回收都更有意义</p>
        
        <router-link 
          to="/auth/register" 
          class="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-10 bg-white text-[#006994] border border-blue-100 rounded-full font-bold shadow-sm hover:shadow-lg hover:border-[#00b4db] hover:text-[#004e92] transition-all duration-300 group whitespace-nowrap max-w-full"
        >
          <span>注册成为志愿者</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 transform group-hover:translate-x-1 transition-transform flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </router-link>
      </div>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'
import WaveBackground from '../components/ocean/WaveBackground.vue'
import { 
  MapIcon, 
  CameraIcon, 
  LinkIcon, 
  ChartBarIcon, 
  ShoppingBagIcon, 
  AcademicCapIcon
} from '@heroicons/vue/24/outline'

const features = [
  { title: '回收地图', icon: MapIcon, link: '/map' },
  { title: '智能识别', icon: CameraIcon, link: '/checkin' },
  { title: '链上溯源', icon: LinkIcon, link: '/blockchain' },
  { title: '数据大屏', icon: ChartBarIcon, link: '/stats' },
  { title: '积分商城', icon: ShoppingBagIcon, link: '/mall' },
  { title: '海洋科普', icon: AcademicCapIcon, link: '/science' }
]

const stats = [
  { value: '12.3t', label: '回收塑料', icon: '🧴' },
  { value: '890+', label: '活跃志愿者', icon: '🤝' },
  { value: '120', label: '回收点位', icon: '📍' },
  { value: '15.6w', label: '碳积分生成', icon: '🌿' }
]

// 气泡动画逻辑
const getBubbleStyle = () => {
  const size = Math.random() * 60 + 20; 
  const left = Math.random() * 100; 
  const duration = Math.random() * 10 + 10; 
  const delay = Math.random() * 5; 
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    bottom: `-${size}px`, 
    animation: `floatUp ${duration}s linear infinite`,
    animationDelay: `${delay}s`,
    opacity: Math.random() * 0.3 + 0.1
  };
};
</script>

<style scoped>
/* 自定义按钮样式类 */
.btn-primary {
  background: linear-gradient(135deg, #00b4db, #0083b0);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(0, 180, 219, 0.4);
  display: inline-flex; 
  align-items: center;
  justify-content: center;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 180, 219, 0.6);
}

.btn-primary.large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  padding: 1rem 2.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 气泡上浮动画 */
@keyframes floatUp {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.8; }
  50% { transform: translateY(-40vh) translateX(20px); }
  100% { transform: translateY(-100vh) translateX(-20px); opacity: 0; }
}

.bubble {
  pointer-events: none; 
}

/* 简单的淡入上浮效果 */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>