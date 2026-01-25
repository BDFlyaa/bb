import { computed, ref } from 'vue';
import { store } from '../../stores';
import { 
  getOverview, 
  getRecentActivities, 
  getRankings, 
  getWeeklyTrend, 
  getInventory, 
  getUserStats,
  type OverviewData,
  type Activity,
  type Ranking,
  type TrendData,
  type InventoryData,
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
  tasks: []
});

const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    if (isAdmin.value) {
      const [overviewData, activitiesData, rankingsData, trendData, inventoryData] = await Promise.all([
        getOverview(),
        getRecentActivities(),
        getRankings(),
        getWeeklyTrend(),
        getInventory()
      ]);
      overview.value = overviewData;
      recentActivities.value = activitiesData;
      rankings.value = rankingsData;
      weeklyTrend.value = trendData;
      inventory.value = inventoryData;
    } else {
      if (store.user && store.user.id) {
        // 同步更新 Store 中的用户信息
        await store.fetchUserProfile();
        
        const stats = await getUserStats(store.user.id);
        userStats.value = stats;
      } else {
        await store.fetchUserProfile();
        if (store.user && store.user.id) {
             const stats = await getUserStats(store.user.id);
             userStats.value = stats;
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

export {
    isAdmin,
    currentTime,
    overview,
    recentActivities,
    rankings,
    weeklyTrend,
    inventory,
    userStats,
    store,
    loading,
    initStatistics
}
