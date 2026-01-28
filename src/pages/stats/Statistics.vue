<template>
  <div class="stats-view">
    <!-- 管理员视图：数据大屏 -->
    <div v-if="isAdmin" class="dashboard-container admin-mode">
      <div class="header-section">
        <div class="header-content">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><path d="M2 22h20"/><path d="M2 12h20"/><path d="M2 7h20"/><path d="M2 17h20"/><path d="M2 12c0-3 2.5-5 5-5s5 2 5 5 0 5 2.5 5 5 5 5-2 5-5"/></svg>
            海洋塑料回收指挥中心
          </h2>
          <div class="sub-header">
            <span class="live-indicator">
              <svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle></svg>
              实时监控中
            </span>
            <span class="update-time">{{ currentTime }}</span>
          </div>
        </div>
      </div>
      
      <!-- 顶部核心指标卡片 -->
      <div class="top-stats-row">
        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper blue-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">累计清理总量</div>
            <div class="stat-value">{{ overview.totalWeight }} <span class="unit">kg</span></div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper green-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">今日新增</div>
            <div class="stat-value">+{{ overview.todayWeight }} <span class="unit">kg</span></div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper cyan-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.05a10 10 0 0 0-10 10h20a10 10 0 0 0-10-10z"></path><path d="M12 2.05v19.95"></path><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">碳减排贡献</div>
            <div class="stat-value">{{ overview.carbonReduction }} <span class="unit">吨</span></div>
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper purple-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">活跃志愿者</div>
            <div class="stat-value">{{ rankings.length }} <span class="unit">人</span></div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid-layout-v2">
        <!-- 左侧主视图：地图与趋势 -->
        <div class="main-column">
          <div class="map-section glass-panel">
            <div class="panel-header">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                回收物资分类占比
              </h3>
            </div>
            <div class="chart-container-pie">
               <!-- 左侧：CSS 3D 饼图/环形图 -->
               <div class="pie-chart-wrapper">
                 <div class="pie-chart-spinner"></div>
                 <div class="inner-circle">
                   <span class="total-label">总回收量</span>
                   <span class="total-value">{{ overview.totalWeight }}</span>
                 </div>
               </div>
               
               <!-- 右侧：图例详情 -->
               <div class="chart-legend">
                 <div class="legend-item">
                   <div class="info-row">
                     <span class="dot" style="background: #00e5ff; box-shadow: 0 0 8px #00e5ff;"></span>
                     <span class="name">PET 塑料瓶</span>
                     <span class="val">35%</span>
                   </div>
                   <div class="bar-bg"><div class="bar" style="width: 35%; background: #00e5ff"></div></div>
                 </div>
                 <div class="legend-item">
                   <div class="info-row">
                     <span class="dot" style="background: #00ff9d; box-shadow: 0 0 8px #00ff9d;"></span>
                     <span class="name">海洋渔网</span>
                     <span class="val">25%</span>
                   </div>
                   <div class="bar-bg"><div class="bar" style="width: 25%; background: #00ff9d"></div></div>
                 </div>
                 <div class="legend-item">
                   <div class="info-row">
                     <span class="dot" style="background: #00b4db; box-shadow: 0 0 8px #00b4db;"></span>
                     <span class="name">HDPE 塑料</span>
                     <span class="val">20%</span>
                   </div>
                   <div class="bar-bg"><div class="bar" style="width: 20%; background: #00b4db"></div></div>
                 </div>
                 <div class="legend-item">
                   <div class="info-row">
                     <span class="dot" style="background: #bd93f9; box-shadow: 0 0 8px #bd93f9;"></span>
                     <span class="name">其他废弃物</span>
                     <span class="val">20%</span>
                   </div>
                   <div class="bar-bg"><div class="bar" style="width: 20%; background: #bd93f9"></div></div>
                 </div>
               </div>
            </div>
          </div>
          
          <div class="chart-section glass-panel mt-20">
            <div class="panel-header">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                近7日回收趋势分析
              </h3>
            </div>
            <div class="trend-chart-v2">
              <div class="chart-bars">
                <div class="bar-wrapper" v-for="(w, i) in weeklyTrend.weights" :key="i">
                  <div class="bar-value-tooltip">{{ w }}kg</div>
                  <div class="bar-fill" :style="{height: Math.min(w * 4, 100) + '%'}"></div>
                  <div class="bar-label">{{ weeklyTrend.days[i] }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧侧边栏：实时数据与排行 -->
        <div class="side-column">
          <div class="glass-panel activity-panel">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.05a10 10 0 0 0-10 10h20a10 10 0 0 0-10-10z"></path><path d="M12 2.05v19.95"></path><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path></svg>
              实时动态监控
            </h3>
            <div class="live-feed-list">
              <div class="feed-item" v-for="(item, i) in recentActivities" :key="i">
                <div class="feed-icon">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="feed-content">
                  <div class="feed-main">
                    <span class="feed-user">{{ item.user }}</span>
                    <span class="feed-action">回收了 <b>{{ item.weight }}kg</b> {{ item.type }}</span>
                  </div>
                  <div class="feed-time">{{ item.time }}</div>
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="empty-state">暂无最新动态</div>
            </div>
          </div>

          <div class="glass-panel ranking-panel mt-20">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
              贡献排行榜
            </h3>
            <div class="ranking-list-v2">
              <div class="rank-row" v-for="(u, i) in rankings.slice(0, 10)" :key="i">
                <div class="rank-idx" :class="'idx-'+(i+1)">{{ i + 1 }}</div>
                <div class="rank-info">
                  <div class="rank-name">{{ u.name }}</div>
                  <div class="rank-bar-bg">
                    <div class="rank-bar-fill" :style="{width: Math.min(u.score/10, 100) + '%'}"></div>
                  </div>
                </div>
                <div class="rank-score">{{ u.score }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 志愿者视图：个人中心 -->
    <div v-else class="dashboard-container user-mode">
      <div class="user-header fade-in">
        <div class="greeting">
          <h2>
            Hi, {{ userStats.username || store.user.username }} 
            <svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
          </h2>
          <p>今天也是守护海洋的好日子！</p>
        </div>
        <div class="user-level-card glass-panel">
          <div class="level-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div class="level-info">
            <div class="level-title">海洋守护者 Lv.{{ userStats.level }}</div>
            <div class="level-progress">
              <div class="progress-bar" :style="{width: userStats.levelProgress + '%'}"></div>
            </div>
            <div class="level-next">距离下一级还需 {{ userStats.pointsToNextLevel }} 积分</div>
          </div>
        </div>
      </div>

      <div class="stats-overview fade-in-up">
        <div class="stat-box glass-panel">
          <div class="icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="0.7em" height="0.7em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>
          </div>
          <div class="stat-content">
            <div class="label">累计回收</div>
            <div class="value">{{ userStats.totalWeight }} <span class="unit">kg</span></div>
          </div>
        </div>
        <div class="stat-box glass-panel">
          <div class="icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="0.7em" height="0.7em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="2"></line></svg>
          </div>
          <div class="stat-content">
            <div class="label">持有积分</div>
            <div class="value">{{ userStats.points }}</div>
          </div>
        </div>
        <div class="stat-box glass-panel">
          <div class="icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="0.7em" height="0.7em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
          </div>
          <div class="stat-content">
            <div class="label">拯救海洋生物</div>
            <div class="value">{{ userStats.savedAnimals }} <span class="unit">只</span></div>
          </div>
        </div>
      </div>

      <div class="main-content-grid">
        <div class="left-section">
          <div class="medal-gallery glass-panel fade-in-up delay-1">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              我的勋章墙
            </h3>
            <div class="medal-grid">
              <div class="medal-slot unlocked" title="初级卫士">
                <div class="medal-icon">
                  <img src="../../assets/images/铜牌.png" alt="初级卫士" style="width: 1em; height: 1em; object-fit: contain;">
                </div>
                <span>初级卫士</span>
              </div>
              <div class="medal-slot unlocked" title="分类达人">
                <div class="medal-icon">
                   <img src="../../assets/images/分类达人.png" alt="分类达人" style="width: 1em; height: 1em; object-fit: contain;">
                </div>
                <span>分类达人</span>
              </div>
              <div class="medal-slot unlocked" title="海洋之友">
                <div class="medal-icon">
                  <img src="../../assets/images/海洋之友.png" alt="海洋之友" style="width: 1em; height: 1em; object-fit: contain;">
                </div>
                <span>海洋之友</span>
              </div>
              <div class="medal-slot locked" title="环保大师">
                <div class="medal-icon">
                  <img src="../../assets/images/环保大师.png" alt="环保大师" style="width: 1em; height: 1em; object-fit: contain;">
                </div>
                <span>环保大师</span>
              </div>
            </div>
          </div>

          <div class="recent-tasks glass-panel fade-in-up delay-2">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              近期任务
            </h3>
            <ul class="task-list">
              <li 
                class="task-item" 
                v-for="task in userStats.tasks" 
                :key="task.id" 
                :class="{ done: task.done }"
                @click="!task.done && handleTaskComplete(task.id)"
                :style="{ cursor: task.done ? 'default' : 'pointer' }"
              >
                <span class="check" :class="{ pending: !task.done }">
                  <svg v-if="task.done" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                </span>
                <span class="text">{{ task.text }}</span>
                <span class="reward">{{ task.reward }}</span>
              </li>
              <!-- 如果没有任务数据，显示默认（或加载中状态） -->
              <li v-if="!userStats.tasks || userStats.tasks.length === 0" class="task-item">
                 <span class="text">暂无近期任务</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="right-section">
          <div class="impact-visual glass-panel fade-in-up delay-3">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M2 22h20"/><path d="M2 12h20"/><path d="M2 7h20"/><path d="M2 17h20"/><path d="M2 12c0-3 2.5-5 5-5s5 2 5 5 0 5 2.5 5 5 5 5-2 5-5"/></svg>
              你的影响力
            </h3>
            <div class="impact-art">
              <!-- 简单的CSS绘图：瓶子变成鱼 -->
              <div class="bottle-to-fish">
                <div class="fish">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16s9-10 20-4C12 22 2 16 2 16"/><path d="M12 12v3"/><path d="M2 16v-4"/></svg>
                </div>
                <div class="arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </div>
                <div class="bottle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6v4h-6z"/><path d="M15 6l2 4v12H7V10l2-4"/></svg>
                </div>
              </div>
              <p class="impact-text">你回收的塑料瓶，避免了它们成为海洋生物的食物。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
    isAdmin,
    currentTime,
    overview,
    recentActivities,
    rankings,
    weeklyTrend,
    userStats,
    store,
    initStatistics,
    handleTaskComplete
} from './Statistics';

onMounted(() => {
    initStatistics();
});
</script>

<style scoped src="./Statistics.css"></style>
