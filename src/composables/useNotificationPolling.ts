import { onMounted, onUnmounted, watch } from 'vue';
import { store } from '../stores';

export function useNotificationPolling(intervalMs = 30000) {
  let timer: ReturnType<typeof setInterval> | null = null;

  function startPolling() {
    if (!store.isLoggedIn) return;
    stopPolling();
    store.fetchUnreadCount();
    timer = setInterval(() => {
      store.fetchUnreadCount();
    }, intervalMs);
  }

  function stopPolling() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // 登录状态变化时自动启停
  watch(() => store.isLoggedIn, (loggedIn) => {
    if (loggedIn) {
      startPolling();
    } else {
      stopPolling();
    }
  }, { immediate: true });

  onMounted(() => {
    if (store.isLoggedIn) {
      startPolling();
    }
  });

  onUnmounted(() => {
    stopPolling();
  });

  return { startPolling, stopPolling };
}
