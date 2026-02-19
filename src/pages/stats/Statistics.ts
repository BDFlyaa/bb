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
  getMonthlyComparison,
  getStationRanking,
  exportStats,
  type OverviewData,
  type Activity,
  type Ranking,
  type TrendData,
  type InventoryData,
  type CategoryBreakdown,
  type UserStats,
  type MonthlyComparison,
  type StationRank
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

// 新增：月度对比 & 站点排行
const monthlyComparison = ref<MonthlyComparison>({
  thisMonth: { weight: '0', count: 0 },
  lastMonth: { weight: '0', count: 0 },
  weightChange: 0,
  countChange: 0
});
const stationRanking = ref<StationRank[]>([]);

// 站点排行最大值，用于计算进度条宽度
const stationMaxWeight = computed(() => {
  if (stationRanking.value.length === 0) return 1;
  return Math.max(...stationRanking.value.map(s => s.totalWeight), 1);
});

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
      const [overviewData, activitiesData, rankingsData, trendData, inventoryData, categoryData, comparisonData, stationData] = await Promise.all([
        getOverview(),
        getRecentActivities(),
        getRankings(),
        getWeeklyTrend(),
        getInventory(),
        getCategoryBreakdown(),
        getMonthlyComparison(),
        getStationRanking()
      ]);
      overview.value = overviewData;
      recentActivities.value = activitiesData;
      rankings.value = rankingsData;
      weeklyTrend.value = trendData;
      inventory.value = inventoryData;
      categoryBreakdown.value = categoryData;
      monthlyComparison.value = comparisonData;
      stationRanking.value = stationData;
    } else {
      if (store.user && store.user.id) {
        await store.fetchUserProfile();
        const stats = await getUserStats(store.user.id);
        userStats.value = stats;
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
  setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);
  fetchData();
};

// 完成任务并获取积分
const handleTaskComplete = async (taskId: number) => {
  if (!store.user?.id) return;
  try {
    const result = await completeTask(store.user.id, taskId);
    if (result.success) {
      userStats.value.points = result.newPoints;
      const task = userStats.value.tasks.find(t => t.id === taskId);
      if (task) task.done = true;
      alert(result.message);
    }
  } catch (error: any) {
    alert(error.response?.data?.message || '完成任务失败');
  }
};

// 饼图渐变
const pieChartGradient = computed(() => {
  const categories = categoryBreakdown.value.categories;
  if (categories.length === 0) {
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

// 勋章图标
const getMedalIcon = (icon: string) => {
  return new URL(`../../assets/images/${icon}`, import.meta.url).href;
};

// 导出 CSV 报表
const handleExport = async () => {
  try {
    const blob = await exportStats();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'recycle_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出报表失败，请重试');
  }
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
  monthlyComparison,
  stationRanking,
  stationMaxWeight,
  initStatistics,
  handleTaskComplete,
  getMedalIcon,
  handleExport
}
