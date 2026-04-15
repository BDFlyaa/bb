import { ref, reactive } from 'vue';
import { store } from '../../stores';
import { articles } from '../../data/articles';
import { videos } from '../../data/videos';
import request from '../../utils/request';

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

// 统计数据
const oceanStats = reactive({
  plasticRemoved: 0,
  volunteers: 0,
  speciesSaved: 0
});

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

// 获取数据并启动动画
const fetchAndAnimateStats = async () => {
  try {
    const response: any = await request.get('/stats/home');
    if (response.success) {
      const data = response.data;
      animateValue('plasticRemoved', 0, data.plasticRemoved, 2000);
      animateValue('volunteers', 0, data.volunteers, 1500);
      animateValue('speciesSaved', 0, data.speciesSaved, 2500);
    } else {
      throw new Error(response.message || '获取数据失败');
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    // 降级使用默认值
    animateValue('plasticRemoved', 0, 15420, 2000);
    animateValue('volunteers', 0, 1284, 1500);
    animateValue('speciesSaved', 0, 42, 2500);
  }
};

// 我不在这个文件里直接调用 onMounted，而是让 Home.vue 在它的 setup 里调用
// 这确保了 onMounted 总是被注册到正确的组件实例上

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

/**
 * 获取图片资源 URL
 * 解决 Vue 模板中无法直接访问 new URL 的问题
 */
const getImageUrl = (name: string) => {
  return new URL(`../../assets/images/${name}`, import.meta.url).href;
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
  closeModal,
  fetchAndAnimateStats,
  getImageUrl // 导出辅助函数
};
