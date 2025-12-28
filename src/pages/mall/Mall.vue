<template>
  <div>
    <h2>🛍️ 积分商城</h2>
    <div class="products-grid">
      <div class="product-card glass-panel" v-for="item in items" :key="item.id">
        <div style="font-size: 3rem;">{{ item.icon }}</div>
        <h4>{{ item.name }}</h4>
        <p style="color: #f4e1c1;">{{ item.points }} 积分</p>
        <button class="btn-primary small">兑换</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { id: 1, name: '环保帆布袋', points: 500, icon: '👜' },
  { id: 2, name: '再生塑料T恤', points: 1200, icon: '👕' },
];
</script>

<style scoped>
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.product-card { padding: 20px; text-align: center; }
</style>