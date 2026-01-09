<template>
  <div class="stats-view">
    <!-- 管理员视图 -->
    <div v-if="isAdmin">
      <div class="header-section">
        <h2>📊 全局数据大屏 (管理端)</h2>
        <div class="last-update">最后更新: {{ currentTime }}</div>
      </div>
      
      <div class="dashboard-grid">
        <div class="chart-card glass-panel wide">
          <h3>城市回收量趋势 (吨)</h3>
          <div class="mock-chart-line">
            <div class="bar" style="height: 40%"><span>1.2</span></div>
            <div class="bar" style="height: 60%"><span>1.8</span></div>
            <div class="bar" style="height: 85%"><span>2.5</span></div>
            <div class="bar" style="height: 50%"><span>1.5</span></div>
            <div class="bar" style="height: 90%"><span>2.8</span></div>
          </div>
          <div class="chart-labels">
            <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span>
          </div>
        </div>

        <div class="stats-sidebar">
          <div class="stat-card glass-panel small">
            <h3>活跃志愿者</h3>
            <div class="stat-value">1,284</div>
            <div class="stat-change positive">↑ 12% 较上周</div>
          </div>
          <div class="stat-card glass-panel small warning">
            <h3>异常站点监控</h3>
            <div class="stat-value">3</div>
            <div class="stat-desc">待处理任务</div>
          </div>
          <div class="stat-card glass-panel small">
            <h3>物资库存预警</h3>
            <div class="inventory-status">
              <div class="item">收集袋: <span class="low">15%</span></div>
              <div class="item">消毒液: <span>82%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 志愿者视图 -->
    <div v-else>
      <div class="header-section">
        <h2>👤 个人环保数据 (执行端)</h2>
        <p>感谢你为海洋环保做出的贡献，{{ store.user.name }}！</p>
      </div>

      <div class="volunteer-dashboard">
        <div class="top-stats">
          <div class="stat-card glass-panel">
            <div class="icon">♻️</div>
            <h3>累计回收量</h3>
            <div class="stat-value">156.5 <span class="unit">kg</span></div>
          </div>
          <div class="stat-card glass-panel">
            <div class="icon">🏆</div>
            <h3>当前排名</h3>
            <div class="stat-value">#42</div>
          </div>
          <div class="stat-card glass-panel">
            <div class="icon">🪙</div>
            <h3>环保积分</h3>
            <div class="stat-value">{{ store.user.points || 1250 }}</div>
          </div>
        </div>

        <div class="bottom-row">
          <div class="medal-section glass-panel">
            <h3>环保勋章</h3>
            <div class="medal-list">
              <div class="medal-item active" title="初级卫士">🏅<p>初级卫士</p></div>
              <div class="medal-item active" title="分类达人">🌟<p>分类达人</p></div>
              <div class="medal-item active" title="海洋之友">🌊<p>海洋之友</p></div>
              <div class="medal-item locked" title="环保大师">👑<p>环保大师</p></div>
            </div>
          </div>
          
          <div class="ranking-preview glass-panel">
            <h3>排行榜 Top 3</h3>
            <ul class="ranking-list">
              <li v-for="(u, i) in rankings" :key="i">
                <span class="rank-num">{{ i + 1 }}</span>
                <span class="name">{{ u.name }}</span>
                <span class="score">{{ u.score }}kg</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { store } from '../../stores';

const isAdmin = computed(() => store.isAdmin);

const currentTime = ref(new Date().toLocaleString());
onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);
});

const rankings = [
  { name: 'Team Alpha', score: 540 },
  { name: 'Sarah Chen', score: 320 },
  { name: 'EcoWarriors', score: 280 },
];
</script>

<style scoped>
.stats-view {
  padding: 10px;
}

.header-section {
  margin-bottom: 25px;
}

.header-section h2 {
  margin: 0;
  font-size: 1.8rem;
  background: linear-gradient(to right, #fff, #00b4db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 管理员样式 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.wide { grid-column: span 1; }

.chart-card {
  padding: 20px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.mock-chart-line {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.bar {
  width: 40px;
  background: linear-gradient(to top, #00b4db, #0083b0);
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: 0.3s;
}

.bar:hover {
  filter: brightness(1.2);
}

.bar span {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #00b4db;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding-top: 10px;
  color: #888;
  font-size: 0.9rem;
}

.stats-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card.small {
  padding: 15px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 10px 0;
}

.stat-card.warning .stat-value {
  color: #ff4d4f;
}

.positive { color: #52c41a; font-size: 0.9rem; }
.inventory-status { text-align: left; font-size: 0.9rem; }
.inventory-status .item { margin: 5px 0; display: flex; justify-content: space-between; }
.low { color: #ff4d4f; font-weight: bold; }

/* 志愿者样式 */
.top-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.top-stats .stat-card {
  padding: 25px;
  text-align: center;
}

.top-stats .icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.unit { font-size: 1rem; color: #888; }

.bottom-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.medal-section {
  padding: 20px;
}

.medal-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.medal-item {
  text-align: center;
  font-size: 2rem;
  padding: 15px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
}

.medal-item.locked {
  filter: grayscale(1);
  opacity: 0.5;
}

.medal-item p {
  font-size: 0.8rem;
  margin-top: 8px;
  color: #aaa;
}

.ranking-preview {
  padding: 20px;
}

.ranking-list {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.ranking-list li {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.rank-num {
  width: 24px;
  height: 24px;
  background: #00b4db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  margin-right: 15px;
}

.ranking-list .name { flex: 1; }
.ranking-list .score { color: #00b4db; font-weight: bold; }
</style>