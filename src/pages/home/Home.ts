import { ref, onMounted, reactive } from 'vue';
import { store } from '../../stores';
import { articles } from '../../data/articles';
import { videos } from '../../data/videos';

const showModal = ref(false);
const showVideoModal = ref(false);
const activeArticle = ref({
  title: '',
  category: '',
  content: '',
  date: '',
  views: 0
});
const activeVideo = ref({
  title: '',
  videoUrl: ''
});

// 模拟实时数据
const oceanStats = reactive({
  plasticRemoved: 0,
  volunteers: 0,
  speciesSaved: 0
});

// 目标数据
const targetStats = {
  plasticRemoved: 15420, // kg
  volunteers: 1284,
  speciesSaved: 42
};

// 数字滚动动画函数
const animateValue = (key: keyof typeof oceanStats, start: number, end: number, duration: number) => {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    oceanStats[key] = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

// 启动动画
const startAnimations = () => {
  animateValue('plasticRemoved', 0, targetStats.plasticRemoved, 2000);
  animateValue('volunteers', 0, targetStats.volunteers, 1500);
  animateValue('speciesSaved', 0, targetStats.speciesSaved, 2500);
};

onMounted(() => {
  // 简单的延时启动，实际项目中可以使用 IntersectionObserver 在元素进入视口时启动
  setTimeout(startAnimations, 500);
});

const openArticle = (id: string) => {
  const article = articles[id];
  if (article) {
    activeArticle.value = article;
    showModal.value = true;
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
  }
};

const openVideo = (id: string) => {
  const video = videos[id];
  if (video) {
    activeVideo.value = video;
    showVideoModal.value = true;
    document.body.style.overflow = 'hidden';
  }
};

const closeModal = () => {
  showModal.value = false;
  showVideoModal.value = false;
  document.body.style.overflow = ''; // 恢复背景滚动
};

export {
  store,
  showModal,
  showVideoModal,
  activeArticle,
  activeVideo,
  oceanStats,
  openArticle,
  openVideo,
  closeModal
};
