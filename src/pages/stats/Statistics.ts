import { computed, ref } from 'vue';
import { store } from '../../stores';
import {
  getOverview,
  getRecentActivities,
  getRankings,
  getWeeklyTrend,
  getInventory,
  getCategoryBreakdown,
  getUserStats,
  completeTask,
  type OverviewData,
  type Activity,
  type Ranking,
  type TrendData,
  type InventoryData,
  type CategoryBreakdown,
  type UserStats
} from '../../api/stats';

const isAdmin = computed(() => store.isAdmin);

const currentTime = ref(new Date().toLocaleString());

// 管理员数据
const overview = ref<OverviewData>({
  totalWeight: '0',
  todayWeight: '0',
  carbonReduction: '0'
});
const recentActivities = ref<Activity[]>([]);
const rankings = ref<Ranking[]>([]);
const weeklyTrend = ref<TrendData>({ days: [], weights: [] });
const inventory = ref<InventoryData>({ items: [] });
const categoryBreakdown = ref<CategoryBreakdown>({ totalWeight: '0', categories: [] });

// 用户数据
const userStats = ref<UserStats>({
  username: '',
  totalWeight: '0',
  points: 0,
  checkinCount: 0,
  savedAnimals: 0,
  level: 1,
  levelProgress: 0,
  pointsToNextLevel: 500,
  tasks: [],
  medals: []
});

const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    if (isAdmin.value) {
      const [overviewData, activitiesData, rankingsData, trendData, inventoryData, categoryData] = await Promise.all([
        getOverview(),
        getRecentActivities(),
        getRankings(),
        getWeeklyTrend(),
        getInventory(),
        getCategoryBreakdown()
      ]);
      overview.value = overviewData;
      recentActivities.value = activitiesData;
      rankings.value = rankingsData;
      weeklyTrend.value = trendData;
      inventory.value = inventoryData;
      categoryBreakdown.value = categoryData;
    } else {
      if (store.user && store.user.id) {
        // 同步更新 Store 中的用户信息
        await store.fetchUserProfile();

        const stats = await getUserStats(store.user.id);
        userStats.value = stats;
        // 同步 store 的积分（包含任务自动发放的积分）
        store.setPoints(stats.points);
      } else {
        await store.fetchUserProfile();
        if (store.user && store.user.id) {
          const stats = await getUserStats(store.user.id);
          userStats.value = stats;
          store.setPoints(stats.points);
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
};

const initStatistics = () => {
  // 更新时间
  setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);

  // 获取数据
  fetchData();
};

// 完成任务并获取积分
const handleTaskComplete = async (taskId: number) => {
  if (!store.user?.id) return;

  try {
    const result = await completeTask(store.user.id, taskId);
    if (result.success) {
      // 更新本地积分显示
      userStats.value.points = result.newPoints;
      // 标记任务已完成
      const task = userStats.value.tasks.find(t => t.id === taskId);
      if (task) task.done = true;
      alert(result.message);
    }
  } catch (error: any) {
    alert(error.response?.data?.message || '完成任务失败');
  }
};

// 生成动态饼图渐变样式
const pieChartGradient = computed(() => {
  const categories = categoryBreakdown.value.categories;
  if (categories.length === 0) {
    // 默认灰色表示无数据
    return 'conic-gradient(#444 0% 100%)';
  }

  let currentPercent = 0;
  const gradientStops = categories.map(cat => {
    const startPercent = currentPercent;
    const endPercent = currentPercent + cat.percentage;
    currentPercent = endPercent;
    return `${cat.color} ${startPercent}% ${endPercent}%`;
  });

  return `conic-gradient(${gradientStops.join(', ')})`;
});

// 获取勋章图标路径
const getMedalIcon = (icon: string) => {
  return new URL(`../../assets/images/${icon}`, import.meta.url).href;
};

export {
  isAdmin,
  currentTime,
  overview,
  recentActivities,
  rankings,
  weeklyTrend,
  inventory,
  categoryBreakdown,
  pieChartGradient,
  userStats,
  store,
  loading,
  initStatistics,
  handleTaskComplete,
  getMedalIcon
}
