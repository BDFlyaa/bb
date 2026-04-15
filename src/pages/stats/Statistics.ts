import { computed, ref, nextTick } from 'vue';
import { store } from '../../stores';
import * as echarts from 'echarts';
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
      const [
        overviewData, 
        activitiesData, 
        rankingsData, 
        trendData, 
        inventoryData, 
        categoryData, 
        comparisonData, 
        stationData

      ] = await Promise.all([
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
      
      // Update charts after data is loaded
      nextTick(() => {
        updateCharts();
      });
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
  window.addEventListener('resize', handleResize);
  fetchData();
};

// 完成任务并获取积分
const handleTaskComplete = async (taskId: number) => {
  if (!store.user?.id) return;
  try {
    const result = await completeTask(store.user.id, taskId);
    if (result.success) {
      userStats.value.points = result.newPoints;
      // 每积累 5000 积分拯救一只海洋生物
      userStats.value.savedAnimals = Math.floor(result.newPoints / 5000);
      const task = userStats.value.tasks.find(t => t.id === taskId);
      if (task) task.done = true;
      alert(result.message);
    }
  } catch (error: any) {
    alert(error.response?.data?.message || '完成任务失败');
  }
};

// ECharts Refs
const pieChartRef = ref<HTMLElement | null>(null);
const trendChartRef = ref<HTMLElement | null>(null);
let pieChartInstance: echarts.ECharts | null = null;
let trendChartInstance: echarts.ECharts | null = null;

const handleResize = () => {
  pieChartInstance?.resize();
  trendChartInstance?.resize();
};

const disposeCharts = () => {
  window.removeEventListener('resize', handleResize);
  pieChartInstance?.dispose();
  trendChartInstance?.dispose();
  pieChartInstance = null;
  trendChartInstance = null;
};

// Initialize and update charts
const updateCharts = () => {
  if (pieChartRef.value) {
    if (!pieChartInstance) {
      pieChartInstance = echarts.init(pieChartRef.value);
    }
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}% ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#fff' }
      },
      series: [
        {
          name: '回收物资分类',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0f172a',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => {
              return `总回收量\n${overview.value.totalWeight}`;
            },
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff',
            lineHeight: 30
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              color: '#fff',
              formatter: '{b}\n{c}%'
            }
          },
          labelLine: {
            show: false
          },
          data: categoryBreakdown.value.categories.map(c => ({
            value: c.percentage,
            name: c.name,
            itemStyle: { color: c.color }
          }))
        }
      ]
    };
    pieChartInstance.setOption(option);
  }

  if (trendChartRef.value) {
    if (!trendChartInstance) {
      trendChartInstance = echarts.init(trendChartRef.value);
    }
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: weeklyTrend.value.days,
          axisTick: { alignWithLabel: true },
          axisLine: { lineStyle: { color: '#aaa' } },
          axisLabel: { color: '#fff' }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { lineStyle: { color: '#aaa' } },
          axisLabel: { color: '#fff' },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        }
      ],
      series: [
        {
          name: '回收重量',
          type: 'bar',
          barWidth: '60%',
          data: weeklyTrend.value.weights,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#00e5ff'
              },
              {
                offset: 1,
                color: '#004d61'
              }
            ])
          }
        }
      ]
    };
    trendChartInstance.setOption(option);
  }
};

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
  userStats,
  store,
  loading,
  monthlyComparison,
  stationRanking,
  stationMaxWeight,
  pieChartRef,
  trendChartRef,
  updateCharts,
  disposeCharts,
  initStatistics,
  handleTaskComplete,
  getMedalIcon,
  handleExport
}
