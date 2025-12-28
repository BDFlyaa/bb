<template>
  <div class="ocean-bg">
    <div class="water-ripple"></div>
    <div v-for="n in 15" :key="n" class="plastic-particle" :style="getParticleStyle()"></div>
  </div>
</template>

<script setup lang="ts">
const getParticleStyle = () => {
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 5 + 's',
    animationDuration: (Math.random() * 10 + 10) + 's',
    opacity: Math.random() * 0.5
  };
};
</script>

<style scoped>
.ocean-bg {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}
.plastic-particle {
  position: absolute;
  bottom: -50px;
  width: 20px; height: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  to { transform: translateY(-120vh) rotate(360deg); }
}
</style>