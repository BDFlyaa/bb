<template>
  <div class="ocean-bg">
    <!-- 渐变背景 -->
    <div class="gradient-overlay"></div>
    
    <!-- 波浪动画 -->
    <div class="waves-container">
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.05)" />
          <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.03)" />
          <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.02)" />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba(255,255,255,0.01)" />
        </g>
      </svg>
    </div>

    <!-- 粒子效果 (气泡/微塑料) -->
    <div v-for="n in 20" :key="n" class="bubble" :style="getBubbleStyle()"></div>
  </div>
</template>

<script setup lang="ts">
const getBubbleStyle = () => {
  const size = Math.random() * 10 + 2;
  return {
    left: Math.random() * 100 + '%',
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: Math.random() * 5 + 's',
    animationDuration: (Math.random() * 10 + 15) + 's',
    opacity: Math.random() * 0.3
  };
};
</script>

<style scoped>
.ocean-bg {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(180deg, #001220 0%, #002540 50%, #004d6e 100%);
  overflow: hidden;
}

.gradient-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 20%, rgba(0, 180, 219, 0.1) 0%, transparent 60%);
}

.waves-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 20%;
  min-height: 100px;
}

.waves {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}
.parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
.parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
.parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }
.parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; }

@keyframes move-forever {
  0% { transform: translate3d(-90px,0,0); }
  100% { transform: translate3d(85px,0,0); }
}

.bubble {
  position: absolute;
  bottom: -20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  animation: floatUp linear infinite;
}

@keyframes floatUp {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  20% { opacity: 0.3; }
  80% { opacity: 0.3; }
  100% { transform: translateY(-110vh) translateX(20px); opacity: 0; }
}
</style>
