<template>
  <MainLayout>
    <h1 class="text-3xl font-bold mb-6">志愿者打卡</h1>
    
    <div class="grid grid-cols-1 grid-cols-2 gap-6">
      <!-- 左侧打卡表单 -->
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <h2 class="text-xl font-semibold mb-4">塑料垃圾回收打卡</h2>
        
        <form @submit.prevent="handleCheckin">
          <!-- 拍照上传区域 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">上传塑料垃圾照片</label>
            <div 
              class="border-2 border-dashed border-ocean-deep/50 rounded-xl p-8 text-center cursor-pointer hover:border-sea-green transition-colors"
              @click="triggerFileInput"
            >
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                class="hidden" 
                @change="handleFileChange"
              >
              <div class="text-6xl mb-4">📸</div>
              <p class="text-gray-400">点击上传照片或拖拽文件到此处</p>
              <p class="text-sm text-gray-500 mt-2">支持 JPG、PNG 格式，大小不超过 5MB</p>
            </div>
            
            <!-- 预览图片 -->
            <div v-if="previewImage" class="mt-4">
              <img :src="previewImage" alt="预览" class="w-full rounded-lg">
            </div>
          </div>
          
          <!-- 垃圾类型 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">垃圾类型</label>
            <select 
              v-model="form.garbageType" 
              class="w-full px-4 py-3 bg-ocean-deep border border-ocean-deep/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-green text-white"
            >
              <option value="">请选择垃圾类型</option>
              <option value="plastic_bottle">塑料瓶</option>
              <option value="plastic_bag">塑料袋</option>
              <option value="plastic_container">塑料容器</option>
              <option value="other_plastic">其他塑料</option>
            </select>
          </div>
          
          <!-- 重量 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">重量 (kg)</label>
            <input 
              type="number" 
              v-model.number="form.weight" 
              placeholder="请输入重量" 
              step="0.1" 
              min="0"
              class="w-full px-4 py-3 bg-ocean-deep border border-ocean-deep/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-green text-white"
            >
          </div>
          
          <!-- 位置信息 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">位置信息</label>
            <div class="flex items-center space-x-2">
              <input 
                type="text" 
                v-model="form.location" 
                placeholder="自动获取位置..." 
                class="flex-1 px-4 py-3 bg-ocean-deep border border-ocean-deep/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-green text-white"
                readonly
              >
              <button 
                type="button" 
                class="px-4 py-3 bg-sea-green hover:bg-sea-green/80 text-white rounded-lg transition-colors"
                @click="getLocation"
              >
                📍 获取位置
              </button>
            </div>
          </div>
          
          <!-- 备注 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">备注</label>
            <textarea 
              v-model="form.remark" 
              placeholder="请输入备注信息" 
              rows="3"
              class="w-full px-4 py-3 bg-ocean-deep border border-ocean-deep/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-green text-white resize-none"
            ></textarea>
          </div>
          
          <!-- 打卡按钮 -->
          <button 
            type="submit" 
            class="w-full bg-sea-green hover:bg-sea-green/80 text-white font-semibold py-3 rounded-lg transition-colors transform hover:scale-105"
          >
            提交打卡
          </button>
        </form>
      </div>
      
      <!-- 右侧AI识别结果 -->
      <div class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <h2 class="text-xl font-semibold mb-4">AI识别结果</h2>
        
        <div v-if="aiResult" class="space-y-4">
          <div class="bg-ocean-deep rounded-lg p-4">
            <h3 class="font-medium mb-2">识别结果</h3>
            <div class="flex items-center">
              <span class="text-sea-green mr-2">✅</span>
              <span>{{ aiResult.type }}</span>
            </div>
          </div>
          
          <div class="bg-ocean-deep rounded-lg p-4">
            <h3 class="font-medium mb-2">置信度</h3>
            <div class="w-full bg-ocean-light rounded-full h-2">
              <div 
                class="bg-sea-green h-2 rounded-full transition-all duration-500" 
                :style="{ width: `${aiResult.confidence}%` }"
              ></div>
            </div>
            <div class="text-right text-sm text-gray-400 mt-1">{{ aiResult.confidence }}%</div>
          </div>
          
          <div class="bg-ocean-deep rounded-lg p-4">
            <h3 class="font-medium mb-2">预估重量</h3>
            <p>{{ aiResult.estimatedWeight }} kg</p>
          </div>
          
          <div class="bg-ocean-deep rounded-lg p-4">
            <h3 class="font-medium mb-2">可获得积分</h3>
            <p class="text-2xl font-bold text-sea-green">{{ aiResult.points }} 积分</p>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">🤖</div>
          <p class="text-gray-400">上传照片后，AI将自动识别垃圾类型</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'

const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref<string | null>(null)
const aiResult = ref<any>(null)

const form = ref({
  garbageType: '',
  weight: 0,
  location: '',
  remark: ''
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string
      // 模拟AI识别
      simulateAiRecognition()
    }
    reader.readAsDataURL(file)
  }
}

// 模拟AI识别
const simulateAiRecognition = () => {
  // 模拟识别延迟
  setTimeout(() => {
    aiResult.value = {
      type: '塑料瓶',
      confidence: 95,
      estimatedWeight: 0.5,
      points: 50
    }
  }, 1000)
}

// 获取位置
const getLocation = () => {
  // 模拟获取位置
  form.value.location = '上海市浦东新区张江高科技园区'
}

// 处理打卡提交
const handleCheckin = () => {
  console.log('打卡提交:', form.value)
  // 这里将实现打卡逻辑
}
</script>
