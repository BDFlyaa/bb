<template>
  <div class="stats-view">
    <h2>📊 回收数据驾驶舱</h2>
    <div class="dashboard-grid">
      <div class="chart-card glass-panel wide">
        <h3>城市回收量趋势 (吨)</h3>
        <div class="mock-chart-line">
          <div class="bar" style="height: 40%"></div>
          <div class="bar" style="height: 60%"></div>
          <div class="bar" style="height: 85%"></div>
          <div class="bar" style="height: 50%"></div>
          <div class="bar" style="height: 90%"></div>
        </div>
      </div>
      <div class="chart-card glass-panel">
        <h3>个人排行榜</h3>
        <ul class="ranking-list">
          <li v-for="(u, i) in rankings" :key="i">
            <span class="rank">{{ i + 1 }}</span> {{ u.name }} <span class="score">{{ u.score }}kg</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const rankings = [
  { name: 'Team Alpha', score: 540 },
  { name: 'Sarah Chen', score: 320 },
  { name: 'EcoWarriors', score: 280 },
];
</script>

<style scoped>
.dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
.chart-card { padding: 20px; height: 300px; }
.mock-chart-line { display: flex; align-items: flex-end; justify-content: space-around; height: 200px; margin-top: 20px; }
.bar { width: 30px; background: linear-gradient(to top, #00b4db, #0083b0); border-radius: 4px 4px 0 0; opacity: 0.8; }
.ranking-list { list-style: none; padding: 0; }
.ranking-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
.rank { background: #00b4db; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.8rem; margin-right: 10px; }
</style>