<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="toast-item"
          :class="toast.type"
        >
          <span class="toast-icon">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </span>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { store } from '../../stores';
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  min-width: 240px;
  max-width: 400px;
  pointer-events: auto;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.toast-item.success {
  background: rgba(0, 200, 120, 0.2);
  border: 1px solid rgba(0, 200, 120, 0.4);
  color: #00ff9d;
}

.toast-item.error {
  background: rgba(255, 80, 80, 0.2);
  border: 1px solid rgba(255, 80, 80, 0.4);
  color: #ff6b6b;
}

.toast-item.info {
  background: rgba(0, 180, 220, 0.2);
  border: 1px solid rgba(0, 180, 220, 0.4);
  color: #00b4db;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* 动画 */
.toast-enter-active { animation: toast-in 0.3s ease-out; }
.toast-leave-active { animation: toast-in 0.2s ease-in reverse; }

@keyframes toast-in {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@media (max-width: 480px) {
  .toast-container {
    left: 10px;
    right: 10px;
  }
  .toast-item {
    max-width: 100%;
  }
}
</style>
