<template>
  <div class="science-landing">
    <WaveBackground />
    
    <!-- 海洋生物装饰 -->
    <div class="marine-life">
      <div class="creature whale">🐋</div>
      <div class="creature turtle">🐢</div>
      <div class="creature fish f1">🐟</div>
      <div class="creature fish f2">🐠</div>
      <div class="creature fish f3">🐡</div>
    </div>

    <!-- 顶部导航 -->
    <nav class="top-nav glass-panel">
      <div class="brand">
        <img src="../../assets/images/logo.png" alt="PureOcean Logo" class="logo-img" />
        <span>PureOcean</span>
      </div>
      <div class="auth-group" v-if="!store.isLoggedIn">
        <router-link to="/login" class="nav-btn login-btn">登录</router-link>
      </div>
      <div class="auth-group" v-else>
        <router-link to="/app/stats" class="nav-btn dashboard-btn">进入工作台</router-link>
      </div>
    </nav>

    <!-- 英雄区 -->
    <header class="hero-section">
      <div class="hero-content fade-in">
        <h1 class="main-title">守护蔚蓝，<span class="highlight-text">共筑未来</span></h1>
        <p class="sub-title">PureOcean 致力于利用区块链与智能识别技术，构建透明、高效的海洋塑料回收生态系统。</p>
        
        <div class="action-buttons">
          <router-link to="/register" class="cta-btn primary-cta" v-if="!store.isLoggedIn">立即加入行动</router-link>
          <a href="#science" class="cta-btn secondary-cta">探索海洋百科</a>
        </div>

        <div class="data-dashboard glass-panel">
          <div class="data-item">
            <span class="data-value">{{ oceanStats.plasticRemoved.toLocaleString() }}</span>
            <span class="data-label">kg 已清理塑料</span>
          </div>
          <div class="data-divider"></div>
          <div class="data-item">
            <span class="data-value">{{ oceanStats.volunteers.toLocaleString() }}</span>
            <span class="data-label">位志愿者</span>
          </div>
          <div class="data-divider"></div>
          <div class="data-item">
            <span class="data-value">{{ oceanStats.speciesSaved }}</span>
            <span class="data-label">种受护物种</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 科普内容区 -->
    <main class="science-content" id="science">
      <div class="section-header">
        <h2 class="section-title"> 海洋百科</h2>
        <p class="section-desc">了解海洋现状，掌握环保知识</p>
      </div>

      <div class="wiki-grid">
        <div class="wiki-card video-card glass-panel fade-in" @click="openVideo('plastic_life')">
          <div class="card-bg"></div>
          <div class="play-icon">▶</div>
          <div class="content-wrapper">
            <span class="category">短视频</span>
            <h3>塑料的一生</h3>
            <p>从石油提取到深海鱼腹，一段关于塑料的奇幻而沉重的旅程。</p>
          </div>
        </div>

        <div class="wiki-card glass-panel article-card">
          <div class="content-wrapper">
            <span class="category">深度阅读</span>
            <h3>看不见的入侵者</h3>
            <p>在深海鱼腹、南极积雪甚至你的饮水中，都潜伏着微塑料的身影...</p>
            <button class="text-btn" @click="openArticle('microplastics')">阅读全文 &rarr;</button>
          </div>
        </div>

        <div class="wiki-card glass-panel game-card">
          <div class="content-wrapper">
            <div class="game-icon">🐢</div>
            <h3>生态保护: 拯救海龟</h3>
            <p>了解海龟面临的塑料威胁，学习如何保护这些古老的航海家。</p>
            <button class="btn-game" @click="openArticle('save_turtles')">
              <span class="btn-text">阅读详情</span>
            </button>
          </div>
        </div>

        <div class="wiki-card glass-panel article-card">
          <div class="content-wrapper">
            <span class="category">数据报告</span>
            <h3>2025 全球海洋现状</h3>
            <p>最新研究显示太平洋垃圾带面积正在发生变化...</p>
            <button class="text-btn">查看报告 &rarr;</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="landing-footer">
      <p>&copy; 2025 PureOcean 海洋塑料回收公益项目</p>
    </footer>

    <!-- 文章阅读弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content glass-panel">
            <button class="close-btn" @click="closeModal">&times;</button>
            <div class="article-body">
              <span class="category">{{ activeArticle.category }}</span>
              <h2 class="article-title">{{ activeArticle.title }}</h2>
              <div class="article-meta">发布时间: {{ activeArticle.date }} | 阅读量: {{ activeArticle.views }}</div>
              <div class="article-text" v-html="activeArticle.content"></div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 视频弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showVideoModal" class="modal-overlay" @click.self="closeModal">
          <div class="video-modal-content glass-panel">
            <button class="close-btn" @click="closeModal">&times;</button>
            <div class="video-container">
              <iframe 
                :src="activeVideo.videoUrl" 
                scrolling="no" 
                border="0" 
                frameborder="no" 
                framespacing="0" 
                allowfullscreen="true"
              ></iframe>
            </div>
            <div class="video-info">
              <h3>{{ activeVideo.title }}</h3>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import WaveBackground from '../../components/ocean/WaveBackground.vue';
import {
  store,
  showModal,
  showVideoModal,
  activeArticle,
  activeVideo,
  oceanStats,
  openArticle,
  openVideo,
  closeModal
} from './Home';
</script>

<style scoped src="./Home.css"></style>
