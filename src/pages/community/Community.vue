<template>
  <div class="community-view">
    <h2>👥 净滩行动广场</h2>
    <div class="community-layout">
      
      <div class="tasks-column">
        <h3>🔥 紧急任务</h3>
        <div class="task-card glass-panel" v-for="task in tasks" :key="task.id">
          <div class="task-header">
            <span class="task-tag">组队</span>
            <span class="task-date">{{ task.date }}</span>
          </div>
          <h4>{{ task.title }}</h4>
          <p class="task-loc">📍 {{ task.loc }}</p>
          <button class="btn-primary small" @click="joinTask(task)">加入队伍</button>
        </div>
      </div>

      <div class="feed-column">
        <h3>动态圈</h3>
        <div class="feed-item glass-panel" v-for="post in feed" :key="post.id">
          <div class="feed-header">
            <strong>{{ post.user }}</strong> <span class="time-ago">刚刚发布</span>
          </div>
          <p class="feed-content">{{ post.content }}</p>
          <div class="feed-actions">
            <span @click="likePost(post)">❤️ {{ post.likes }}</span>
            <span>💬 评论</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 定义接口类型
interface Task {
  id: number;
  title: string;
  loc: string;
  date: string;
}

interface Post {
  id: number;
  user: string;
  content: string;
  likes: number;
}

// 模拟数据
const tasks = ref<Task[]>([
  { id: 1, title: '黄金海岸净滩行动', loc: '阳光海滩 Sector A', date: '周六 09:00' },
  { id: 2, title: '河流拦截网清理', loc: '大河口入海处', date: '周日 14:00' },
  { id: 3, title: '红树林塑料清理', loc: '湿地保护区', date: '下周三 10:00' },
]);

const feed = ref<Post[]>([
  { id: 1, user: '李明', content: '今天捡了5公斤塑料瓶，感觉很有成就感！#守护海洋', likes: 24 },
  { id: 2, user: 'OceanLover', content: '发现一个新的微塑料聚集点，已在地图上申报。大家注意安全！', likes: 15 },
  { id: 3, user: 'Volunteer_007', content: '刚兑换了环保T恤，质量很棒，大家快去商城看看。', likes: 8 },
]);

// 交互逻辑
const joinTask = (task: Task) => {
  alert(`成功加入任务：“${task.title}”！请准时到达集合点。`);
};

const likePost = (post: Post) => {
  post.likes++;
};
</script>

<style scoped>
.community-layout {
  display: flex;
  gap: 20px;
  flex-wrap: wrap; /* 移动端适配 */
}

.tasks-column { flex: 1; min-width: 300px; }
.feed-column { flex: 1.5; min-width: 300px; }

/* 任务卡片样式 */
.task-card {
  padding: 15px;
  margin-bottom: 15px;
  transition: transform 0.2s;
}
.task-card:hover { transform: translateY(-3px); }
.task-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
.task-tag { background: #ff4757; padding: 2px 8px; font-size: 0.7rem; border-radius: 4px; }
.task-date { font-size: 0.8rem; color: #ddd; }
.task-loc { font-size: 0.9rem; color: #ccc; margin: 5px 0 10px 0; }

/* 动态样式 */
.feed-item {
  padding: 15px;
  margin-bottom: 15px;
}
.feed-header { margin-bottom: 10px; font-size: 0.9rem; color: #ccc; }
.feed-header strong { color: #fff; font-size: 1rem; }
.time-ago { float: right; font-size: 0.8rem; opacity: 0.7; }
.feed-content { line-height: 1.5; }
.feed-actions {
  margin-top: 10px;
  display: flex;
  gap: 20px;
  color: #00b4db;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>