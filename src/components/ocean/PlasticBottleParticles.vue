<template>
  <div class="relative w-full h-full overflow-hidden pointer-events-none">
    <div 
      v-for="i in particleCount" 
      :key="i"
      class="absolute plastic-bottle"
      :style="{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${5 + Math.random() * 10}s`,
        transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`
      }"
    >
      🍶
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  particleCount?: number
}>()
</script>

<style scoped>
.plastic-bottle {
  font-size: 2rem;
  opacity: 0.3;
  animation: float-animation linear infinite;
  transition: opacity 0.3s ease;
}

.plastic-bottle:hover {
  opacity: 0.6;
}

@keyframes float-animation {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
  }
  75% {
    transform: translateY(-30px) rotate(270deg);
  }
}
</style>
