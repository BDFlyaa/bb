<template>
  <MainLayout>
    <!-- 英雄区域 -->
    <section class="relative overflow-hidden rounded-3xl p-24 mb-20 group">
      <!-- 动态背景 -->
      <WaveBackground class="absolute inset-0 rounded-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-80" />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-ocean-deep/50 to-ocean-deep rounded-3xl pointer-events-none"></div>
      
      <!-- 粒子效果层 -->
      <PlasticBottleParticles :particleCount="20" class="absolute inset-0 opacity-80" />
      
      <!-- 内容层 -->
      <div class="relative z-10 max-w-4xl mx-auto text-center pt-10">
        <div class="inline-flex items-center px-3 py-1 rounded-full bg-sea-green/10 border border-sea-green/20 text-sea-green text-sm font-medium mb-8 animate-fade-in-up">
          <span class="w-2 h-2 rounded-full bg-sea-green mr-2 animate-pulse"></span>
          基于区块链与AI技术的环保平台
        </div>
        
        <h1 class="text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-sea-green leading-tight tracking-tight">
          保护海洋<br/>
          <span class="text-sea-green">从回收每一块塑料开始</span>
        </h1>
        
        <p class="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          加入全球最大的去中心化海洋保护网络。记录你的环保行动，获取代币奖励，让每一次回收都可追溯。
        </p>
        
        <div class="flex flex-row items-center justify-center gap-6">
          <router-link to="/register" class="w-auto px-8 py-4 rounded-xl bg-sea-green hover:bg-sea-green-dark text-white font-bold text-lg shadow-lg shadow-sea-green/25 hover:shadow-sea-green/40 transition-all transform hover:-translate-y-1 flex items-center justify-center">
            <UserPlusIcon class="w-5 h-5 mr-2" />
            立即加入
          </router-link>
          <router-link to="/map" class="w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-lg border border-white/10 transition-all transform hover:-translate-y-1 flex items-center justify-center">
            <MapIcon class="w-5 h-5 mr-2" />
            查找回收点
          </router-link>
        </div>

        <!-- 简单的信任背书 -->
        <div class="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <span class="text-lg font-bold tracking-widest text-white">ECO-CHAIN</span>
          <span class="text-lg font-bold tracking-widest text-white">OCEAN-AI</span>
          <span class="text-lg font-bold tracking-widest text-white">GREEN-NET</span>
        </div>
      </div>
    </section>
    
    <!-- 核心功能网格 -->
    <section class="mb-24 container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-white">全方位的环保生态</h2>
        <p class="text-gray-400 max-w-2xl mx-auto">通过科技赋能环保，让公益更透明、更有趣、更有价值</p>
      </div>
      
      <div class="grid grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title" class="group relative bg-ocean-medium/40 backdrop-blur-sm rounded-2xl p-8 hover:bg-ocean-medium/60 transition-all duration-300 border border-white/5 hover:border-sea-green/30 hover:shadow-2xl hover:shadow-sea-green/5">
          <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
             <component :is="feature.icon" class="w-24 h-24 text-sea-green" />
          </div>
          
          <div class="w-14 h-14 bg-gradient-to-br from-sea-green/20 to-transparent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-sea-green/10">
            <component :is="feature.icon" class="w-7 h-7 text-sea-green" />
          </div>
          
          <h3 class="text-xl font-bold mb-3 text-white group-hover:text-sea-green transition-colors">{{ feature.title }}</h3>
          <p class="text-gray-400 mb-6 leading-relaxed">{{ feature.desc }}</p>
          
          <router-link :to="feature.link" class="inline-flex items-center text-sm font-semibold text-sea-green hover:text-sea-green-light transition-colors group-hover:translate-x-1 duration-200">
            了解更多 <ArrowRightIcon class="w-4 h-4 ml-1" />
          </router-link>
        </div>
      </div>
    </section>
    
    <!-- 数据展示 -->
    <section class="mb-24">
      <div class="bg-gradient-to-r from-ocean-medium to-ocean-dark rounded-3xl p-12 border border-white/5 relative overflow-hidden shadow-2xl">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sea-green via-blue-500 to-purple-500"></div>
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-sea-green/10 rounded-full blur-3xl"></div>
        
        <div class="grid grid-cols-4 gap-12 relative z-10">
          <div v-for="stat in stats" :key="stat.label" class="text-center group">
            <div class="text-5xl font-bold text-white mb-2 tracking-tight group-hover:text-sea-green transition-colors">{{ stat.value }}</div>
            <div class="text-sea-green text-sm font-medium uppercase tracking-wider mb-2">{{ stat.label }}</div>
            <div class="text-gray-500 text-xs">{{ stat.sub }}</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 行动号召 -->
    <section class="text-center py-16 relative mb-12">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-ocean-medium/30 rounded-full blur-3xl -z-10"></div>
      <h2 class="text-4xl font-bold mb-6 text-white">准备好改变世界了吗？</h2>
      <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
        这一刻，从注册成为海洋守护者开始。每一次回收，都值得被铭记。
      </p>
      <div class="flex flex-row items-center justify-center gap-4">
        <router-link to="/register" class="px-10 py-4 rounded-full bg-white text-ocean-deep font-bold hover:bg-gray-100 transition-colors shadow-xl shadow-white/10 transform hover:scale-105">
          立即开始
        </router-link>
      </div>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'
import WaveBackground from '../components/ocean/WaveBackground.vue'
import PlasticBottleParticles from '../components/ocean/PlasticBottleParticles.vue'
import { 
  MapIcon, 
  CameraIcon, 
  LinkIcon, 
  ChartBarIcon, 
  ShoppingBagIcon, 
  AcademicCapIcon,
  UserPlusIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'

const features = [
  {
    title: '回收点地图',
    desc: '实时查看附近的塑料回收点，支持一键导航与在线申报新点位。',
    icon: MapIcon,
    link: '/map'
  },
  {
    title: 'AI 智能识别',
    desc: '拍照上传塑料垃圾，AI 自动识别分类，让垃圾分类变得简单高效。',
    icon: CameraIcon,
    link: '/checkin'
  },
  {
    title: '区块链溯源',
    desc: '基于区块链技术，确保每一次回收记录不可篡改，全程可追溯。',
    icon: LinkIcon,
    link: '/blockchain'
  },
  {
    title: '可视化数据',
    desc: '直观的数据大屏，实时展示个人与全球的海洋保护成果。',
    icon: ChartBarIcon,
    link: '/stats'
  },
  {
    title: '绿色积分商城',
    desc: '用回收积分兑换环保周边与公益权益，让爱心有回报。',
    icon: ShoppingBagIcon,
    link: '/mall'
  },
  {
    title: '海洋科普',
    desc: '丰富的海洋环保知识库，通过趣味互动提升环保意识。',
    icon: AcademicCapIcon,
    link: '/science'
  }
]

const stats = [
  { value: '12,345', label: '回收塑料(kg)', sub: '相当于减少 30 吨碳排放' },
  { value: '890+', label: '活跃志愿者', sub: '遍布全球 50 个城市' },
  { value: '120', label: '回收点位', sub: '覆盖主要沿海区域' },
  { value: '15.6w', label: '产生的积分', sub: '已兑换 500+ 份礼品' }
]
</script>
