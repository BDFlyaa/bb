<template>
  <MainLayout>
    <h1 class="text-3xl font-bold mb-6">区块链溯源</h1>
    
    <div class="grid grid-cols-1 grid-cols-3 gap-6">
      <!-- 左侧查询区域 -->
      <div class="col-span-1 bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
        <h2 class="text-xl font-semibold mb-4">查询回收记录</h2>
        
        <div class="space-y-4">
          <div>
            <label for="hash" class="block text-sm font-medium text-gray-300 mb-2">哈希值</label>
            <input 
              type="text" 
              id="hash" 
              v-model="searchHash" 
              placeholder="请输入哈希值" 
              class="w-full px-4 py-3 bg-ocean-deep border border-ocean-deep/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-green text-white"
            >
          </div>
          
          <button 
            class="w-full bg-sea-green hover:bg-sea-green/80 text-white font-semibold py-3 rounded-lg transition-colors"
            @click="searchRecord"
          >
            查询
          </button>
          
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-3">最近记录</h3>
            <div class="space-y-3">
              <div 
                v-for="record in recentRecords" 
                :key="record.id" 
                class="bg-ocean-deep rounded-lg p-3 cursor-pointer hover:bg-ocean-deep/80 transition-colors"
                @click="searchHash = record.hash"
              >
                <div class="text-sm font-medium">{{ record.name }}</div>
                <div class="text-xs text-gray-400 truncate">{{ record.hash }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧结果展示 -->
      <div class="col-span-2">
        <div v-if="blockchainRecord" class="bg-ocean-light rounded-xl p-6 border border-ocean-deep/50">
          <h2 class="text-xl font-semibold mb-4">溯源结果</h2>
          
          <div class="space-y-4">
            <!-- 基本信息 -->
            <div class="bg-ocean-deep rounded-lg p-4">
              <h3 class="font-medium mb-2">基本信息</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-400">哈希值</div>
                  <div class="font-mono text-sm break-all">{{ blockchainRecord.hash }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">区块高度</div>
                  <div>{{ blockchainRecord.blockHeight }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">时间戳</div>
                  <div>{{ blockchainRecord.timestamp }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">状态</div>
                  <div class="text-sea-green">✅ 已确认</div>
                </div>
              </div>
            </div>
            
            <!-- 回收信息 -->
            <div class="bg-ocean-deep rounded-lg p-4">
              <h3 class="font-medium mb-2">回收信息</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-400">回收类型</div>
                  <div>{{ blockchainRecord.recycleType }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">重量</div>
                  <div>{{ blockchainRecord.weight }} kg</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">回收地点</div>
                  <div>{{ blockchainRecord.location }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">回收人</div>
                  <div>{{ blockchainRecord.recycler }}</div>
                </div>
              </div>
            </div>
            
            <!-- 处理信息 -->
            <div class="bg-ocean-deep rounded-lg p-4">
              <h3 class="font-medium mb-2">处理信息</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-400">处理状态</div>
                  <div>{{ blockchainRecord.processStatus }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">处理时间</div>
                  <div>{{ blockchainRecord.processTime }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">处理机构</div>
                  <div>{{ blockchainRecord.processOrg }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="bg-ocean-light rounded-xl p-16 text-center border border-ocean-deep/50">
          <div class="text-6xl mb-4">🔗</div>
          <h3 class="text-xl font-semibold mb-2">暂无查询结果</h3>
          <p class="text-gray-400">请输入哈希值查询回收记录</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'

const searchHash = ref('')
const blockchainRecord = ref<any>(null)

// 最近记录
const recentRecords = ref([
  { id: 1, name: '回收记录 #1', hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' },
  { id: 2, name: '回收记录 #2', hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' },
  { id: 3, name: '回收记录 #3', hash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678' }
])

// 查询记录
const searchRecord = () => {
  // 模拟查询结果
  blockchainRecord.value = {
    hash: searchHash.value || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockHeight: 123456,
    timestamp: '2025-12-10 15:30:00',
    recycleType: '塑料瓶',
    weight: 0.5,
    location: '上海市浦东新区张江高科技园区',
    recycler: '志愿者A',
    processStatus: '已处理',
    processTime: '2025-12-10 16:00:00',
    processOrg: '海洋塑料回收中心'
  }
}
</script>
