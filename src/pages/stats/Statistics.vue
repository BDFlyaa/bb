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
        <h2>👤 个人环保数据 </h2>
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
import {
    isAdmin,
    currentTime,
    rankings,
    store
} from './Statistics';
</script>

<style scoped src="./Statistics.css"></style>