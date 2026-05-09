<template>
  <button class="notification-bell" @click="store.toggleNotificationPanel()" title="通知">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    <Transition name="pop">
      <span v-if="store.unreadCount > 0" class="badge">
        {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
      </span>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { store } from '../../stores';
</script>

<style scoped>
.notification-bell {
  position: relative;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notification-bell:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.badge {
  position: absolute;
  top: -2px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ff4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  pointer-events: none;
}

.pop-enter-active { animation: pop-in 0.25s ease-out; }
.pop-leave-active { animation: pop-in 0.15s ease-in reverse; }

@keyframes pop-in {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
