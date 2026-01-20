<template>
  <div class="stats-view">
    <!-- 管理员视图：数据大屏 -->
    <div v-if="isAdmin" class="dashboard-container admin-mode">
      <div class="header-section">
        <div class="header-content">
          <h2>🌊 海洋塑料回收指挥中心</h2>
          <div class="sub-header">
            <span class="live-indicator">● 实时监控中</span>
            <span class="update-time">{{ currentTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="dashboard-grid-layout">
        <!-- 左侧栏：实时数据 -->
        <div class="column left-col">
          <div class="glass-panel card-glow">
            <h3>📡 实时回收动态</h3>
            <div class="activity-list">
              <div class="activity-item" v-for="(item, i) in recentActivities" :key="i">
                <span class="time">{{ item.time }}</span>
                <span class="user">{{ item.user }}</span>
                <span class="action">回收了 {{ item.weight }}kg {{ item.type }}</span>
              </div>
            </div>
          </div>
          
          <div class="glass-panel card-glow mt-20">
            <h3>📦 物资库存监控</h3>
            <div class="inventory-bars">
              <div class="inv-item">
                <div class="label"><span>回收袋</span> <span class="val warning">15%</span></div>
                <div class="progress-bg"><div class="progress-bar warning" style="width: 15%"></div></div>
              </div>
              <div class="inv-item">
                <div class="label"><span>手套</span> <span>85%</span></div>
                <div class="progress-bg"><div class="progress-bar" style="width: 85%"></div></div>
              </div>
              <div class="inv-item">
                <div class="label"><span>消毒液</span> <span>60%</span></div>
                <div class="progress-bg"><div class="progress-bar" style="width: 60%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间栏：核心指标与地图 -->
        <div class="column center-col">
          <div class="total-impact-card glass-panel">
            <div class="impact-title">累计清理海洋垃圾</div>
            <div class="impact-number">
              <span class="num">12,580.5</span>
              <span class="unit">kg</span>
            </div>
            <div class="impact-sub">
              <span>今日新增: +125.8kg</span>
              <span>减少碳排放: 35.2吨</span>
            </div>
          </div>

          <div class="map-visualization glass-panel">
            <!-- 模拟地图效果 -->
            <div class="map-placeholder">
              <div class="map-grid"></div>
              <div class="map-point p1"></div>
              <div class="map-point p2"></div>
              <div class="map-point p3"></div>
              <div class="radar-scan"></div>
              <div class="map-label">回收热点分布</div>
            </div>
          </div>
        </div>

        <!-- 右侧栏：趋势与排行 -->
        <div class="column right-col">
          <div class="glass-panel card-glow">
            <h3>📈 7日回收趋势</h3>
            <div class="chart-box">
              <div class="mock-chart-line">
                <div class="bar-group" v-for="h in [40, 60, 45, 80, 55, 90, 75]" :key="h">
                  <div class="bar" :style="{height: h + '%'}"></div>
                </div>
              </div>
              <div class="chart-x-axis">
                <span>周一</span><span>周三</span><span>周五</span><span>周日</span>
              </div>
            </div>
          </div>

          <div class="glass-panel card-glow mt-20">
            <h3>🏆 志愿者贡献榜</h3>
            <div class="top-list">
              <div class="top-item" v-for="(u, i) in rankings.slice(0, 5)" :key="i">
                <div class="rank-badge" :class="'rank-'+(i+1)">{{ i + 1 }}</div>
                <div class="user-info">
                  <span class="name">{{ u.name }}</span>
                  <div class="level-bar" :style="{width: (u.score/200)*100 + 'px'}"></div>
                </div>
                <span class="score">{{ u.score }}kg</span>
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
          <h2>Hi, {{ store.user.name }} 👋</h2>
          <p>今天也是守护海洋的好日子！</p>
        </div>
        <div class="user-level-card glass-panel">
          <div class="level-icon">🐬</div>
          <div class="level-info">
            <div class="level-title">海洋守护者 Lv.3</div>
            <div class="level-progress">
              <div class="progress-bar" style="width: 75%"></div>
            </div>
            <div class="level-next">距离下一级还需 250 积分</div>
          </div>
        </div>
      </div>

      <div class="stats-overview fade-in-up">
        <div class="stat-box glass-panel">
          <div class="icon-bg">⚖️</div>
          <div class="stat-content">
            <div class="label">累计回收</div>
            <div class="value">156.5 <span class="unit">kg</span></div>
          </div>
        </div>
        <div class="stat-box glass-panel">
          <div class="icon-bg">🪙</div>
          <div class="stat-content">
            <div class="label">持有积分</div>
            <div class="value">{{ store.user.points || 1250 }}</div>
          </div>
        </div>
        <div class="stat-box glass-panel">
          <div class="icon-bg">🐢</div>
          <div class="stat-content">
            <div class="label">拯救海洋生物</div>
            <div class="value">12 <span class="unit">只</span></div>
          </div>
        </div>
      </div>

      <div class="main-content-grid">
        <div class="left-section">
          <div class="medal-gallery glass-panel fade-in-up delay-1">
            <h3>🏅 我的勋章墙</h3>
            <div class="medal-grid">
              <div class="medal-slot unlocked" title="初级卫士">
                <div class="medal-icon">🥉</div>
                <span>初级卫士</span>
              </div>
              <div class="medal-slot unlocked" title="分类达人">
                <div class="medal-icon">🥈</div>
                <span>分类达人</span>
              </div>
              <div class="medal-slot unlocked" title="海洋之友">
                <div class="medal-icon">🌊</div>
                <span>海洋之友</span>
              </div>
              <div class="medal-slot locked" title="环保大师">
                <div class="medal-icon">👑</div>
                <span>环保大师</span>
              </div>
            </div>
          </div>

          <div class="recent-tasks glass-panel fade-in-up delay-2">
            <h3>📝 近期任务</h3>
            <ul class="task-list">
              <li class="task-item done">
                <span class="check">✅</span>
                <span class="text">完成一次塑料瓶回收</span>
                <span class="reward">+50积分</span>
              </li>
              <li class="task-item done">
                <span class="check">✅</span>
                <span class="text">参与海滩清洁活动</span>
                <span class="reward">+200积分</span>
              </li>
              <li class="task-item">
                <span class="check pending">⭕</span>
                <span class="text">邀请一位好友加入</span>
                <span class="reward">+100积分</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="right-section">
          <div class="impact-visual glass-panel fade-in-up delay-3">
            <h3>🌊 你的影响力</h3>
            <div class="impact-art">
              <!-- 简单的CSS绘图：瓶子变成鱼 -->
              <div class="bottle-to-fish">
                <div class="fish">🐟</div>
                <div class="arrow">⬅️</div>
                <div class="bottle">🍾</div>
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
import { ref } from 'vue';
import {
    isAdmin,
    currentTime,
    rankings,
    store
} from './Statistics';

// 模拟实时活动数据
const recentActivities = ref([
  { time: '10:23', user: '张三', weight: 1.2, type: '塑料瓶' },
  { time: '10:21', user: '李四', weight: 0.8, type: '渔网' },
  { time: '10:15', user: '王五', weight: 2.5, type: '混合塑料' },
  { time: '10:08', user: '赵六', weight: 1.5, type: '塑料瓶' },
  { time: '09:55', user: '钱七', weight: 3.0, type: '海洋漂浮物' },
]);

</script>

<style scoped src="./Statistics.css"></style>
