import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { store } from '../../stores';
import request from '../../utils/request';

const MAP_API = '/map';

export function useMapLogic() {
  const isAdmin = computed(() => store.isAdmin);

  const showReportModal = ref(false);
  const showIssueModal = ref(false);
  const showAuditModal = ref(false);
  const showErrorListModal = ref(false);
  const showEditModal = ref(false);
  const showDeleteModal = ref(false);
  const deleteTarget = ref<any>(null);
  const isPickingLocation = ref(false);
  const loading = ref(true);
  const searchKey = ref('');

  const reportForm = reactive({
    name: '',
    address: '',
    lng: null as number | null,
    lat: null as number | null
  });

  const editForm = reactive({
    id: 0,
    name: '',
    address: '',
    status: 'normal'
  });

  const issueForm = reactive({
    stationId: null as number | null,
    type: 'full',
    desc: ''
  });

  // 数据状态
  const mockStations = ref<any[]>([]); // 兼容旧命名，实际是真实数据
  const pendingAudits = ref<any[]>([]);
  const errorReports = ref<any[]>([]);

  const pendingCount = computed(() => pendingAudits.value.length);
  const errorCount = computed(() => errorReports.value.length);

  let map: any = null;
  let geocoder: any = null;
  let placeSearch: any = null;
  let driving: any = null;
  let markers: any[] = [];
  let userLocation: any = null;
  const isNavigating = ref(false);

  // 缓存站点数据（预加载）
  let stationsDataCache: any[] | null = null;

  // 获取数据 - 优化：支持返回数据供预加载使用
  const fetchStations = async (useCache = false) => {
    try {
      // 如果有缓存数据，直接使用
      if (useCache && stationsDataCache) {
        mockStations.value = stationsDataCache;
        stationsDataCache = null; // 用完清除
        refreshMarkers();
        return;
      }
      const res = await request.get<any, any>(`${MAP_API}/stations`);
      mockStations.value = res;
      refreshMarkers();
    } catch (e) {
      console.error('获取站点失败', e);
    }
  };

  const fetchAudits = async () => {
    if (!isAdmin.value) return;
    try {
      const res = await request.get<any, any>(`${MAP_API}/audit`);
      pendingAudits.value = res;
    } catch (e) {
      console.error('获取审核列表失败', e);
    }
  };

  const fetchReports = async () => {
    if (!isAdmin.value) return;
    try {
      const res = await request.get<any, any>(`${MAP_API}/report`);
      errorReports.value = res;
    } catch (e) {
      console.error('获取报错列表失败', e);
    }
  };

  // 预加载数据（与地图加载并行）
  const preloadData = async () => {
    try {
      const res = await request.get<any, any>(`${MAP_API}/stations`);
      stationsDataCache = res;
    } catch (e) {
      console.error('预加载站点失败', e);
    }
  };

  // 并行加载管理员数据
  const loadAdminData = () => {
    if (!isAdmin.value) return;
    // 使用 Promise.all 并行请求
    Promise.all([fetchAudits(), fetchReports()]).catch(e => {
      console.error('加载管理员数据失败', e);
    });
  };

  const initMap = () => {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: '7b7509159aefd262b8ec05227c8e19da',
    };

    //  预加载数据（与地图SDK加载并行）
    preloadData();
    loadAdminData();

    AMapLoader.load({
      key: 'dc05c7a1f7f1312191532da4e379f188',
      version: '2.0',
      //   精简插件，只加载必需的
      plugins: [
        'AMap.Marker',
        'AMap.InfoWindow',
        'AMap.ToolBar',
        'AMap.Geocoder',
        'AMap.Driving'
      ]
    }).then((AMap) => {
      (window as any).AMap = AMap;
      map = new AMap.Map('container', {
        viewMode: '2D', //  2D模式渲染更快
        zoom: 13,
        center: [110.359377, 21.270708], // 湛江
        theme: 'amap://styles/darkblue'
      });

      map.addControl(new AMap.ToolBar({ position: 'RT' }));

      //  延迟加载非必需插件
      setTimeout(() => {
        AMapLoader.load({
          key: 'dc05c7a1f7f1312191532da4e379f188',
          version: '2.0',
          plugins: ['AMap.Scale', 'AMap.PlaceSearch', 'AMap.Geolocation']
        }).then(() => {
          map.addControl(new AMap.Scale());
          placeSearch = new AMap.PlaceSearch({ map: map });

          //  定位改为后台静默执行
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            buttonPosition: 'RB',
            buttonOffset: new AMap.Pixel(10, 20),
            zoomToAccuracy: false,
          });
          map.addControl(geolocation);

          geolocation.getCurrentPosition((status: string, result: any) => {
            if (status === 'complete') {
              userLocation = result.position;
            }
          });

          geolocation.on('complete', (data: any) => {
            userLocation = data.position;
          });

          driving = new AMap.Driving({
            map: map,
            panel: undefined, // 不显示文字面板，只显示地图路径
            hideMarkers: false
          });
        });
      }, 100);

      geocoder = new AMap.Geocoder({ city: '全国' });

      // 使用预加载的缓存数据
      fetchStations(true);

      map.on('click', (e: any) => {
        if (isPickingLocation.value) {
          const lnglat = e.lnglat;
          reportForm.lng = lnglat.getLng();
          reportForm.lat = lnglat.getLat();

          geocoder.getAddress(lnglat, (status: string, result: any) => {
            if (status === 'complete' && result.regeocode) {
              reportForm.address = result.regeocode.formattedAddress;
            }
          });

          if ((window as any).tempMarker) {
            (window as any).tempMarker.setPosition(lnglat);
          } else {
            (window as any).tempMarker = new AMap.Marker({
              position: lnglat,
              icon: new AMap.Icon({
                size: new AMap.Size(25, 34),
                image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
                imageSize: new AMap.Size(25, 34)
              }),
              map: map
            });
          }

          isPickingLocation.value = false;
          showReportModal.value = true;
          map.setDefaultCursor('default');
        }
      });

      loading.value = false;
    }).catch(e => {
      console.error('地图加载失败:', e);
      loading.value = false;
    });
  };

  const refreshMarkers = () => {
    if (!map) return;
    // 清除旧标记
    map.remove(markers);
    markers = [];

    mockStations.value.forEach(station => {
      addMarker(station);
    });
  };

  const addMarker = (station: any) => {
    if (!map) return;
    const AMap = (window as any).AMap;

    const marker = new AMap.Marker({
      position: [station.lng, station.lat],
      title: station.name,
      map: map,
      animation: 'AMAP_ANIMATION_DROP',
      content: `
        <div class="custom-marker">
          <div class="marker-pin"></div>
          <div class="marker-icon">♻️</div>
        </div>
      `,
      offset: new AMap.Pixel(-15, -30)
    });

    markers.push(marker);

    marker.on('click', () => {
      const infoWindow = new AMap.InfoWindow({
        content: `<div style="color:#333;padding:10px;min-width:150px;">
          <b style="font-size:14px;">${station.name}</b>
          <p style="margin:5px 0 0;font-size:12px;color:#666;">${station.address}</p>
          <div style="margin-top:5px;">
             <span style="font-size:12px;padding:2px 5px;border-radius:3px;background:${station.status === 'full' ? '#ff4d4f' : '#52c41a'};color:white;">${station.statusText}</span>
          </div>
          <button onclick="window.focusStationById(${station.id})" style="margin-top:8px;background:#00e5ff;border:none;color:white;padding:4px 8px;border-radius:4px;cursor:pointer;width:100%;">详情</button>
        </div>`,
        offset: new AMap.Pixel(0, -30)
      });
      infoWindow.open(map, marker.getPosition());
    });
  };

  const handleSearch = () => {
    if (!searchKey.value || !placeSearch) return;
    placeSearch.search(searchKey.value);
  };

  const startPicking = () => {
    isPickingLocation.value = true;
    if (map) {
      map.setDefaultCursor('crosshair');
    }
  };

  const cancelPicking = () => {
    isPickingLocation.value = false;
    if (map) {
      map.setDefaultCursor('default');
    }
  };

  (window as any).focusStationById = (id: number) => {
    const station = mockStations.value.find(s => s.id === id);
    if (station) {
      focusStation(station);
    }
  };

  const focusStation = (station: any) => {
    if (map) {
      map.setZoomAndCenter(15, [station.lng, station.lat]);
    }
  };

  const submitReport = async () => {
    if (!reportForm.name || !reportForm.lng || !reportForm.lat) {
      alert('请填写完整信息并选择位置');
      return;
    }

    try {
      if (isAdmin.value) {
        // 管理员直接添加
        await request.post(`${MAP_API}/stations`, {
          name: reportForm.name,
          address: reportForm.address,
          lng: reportForm.lng,
          lat: reportForm.lat,
          status: 'normal'
        });
        
        fetchStations();
      } else {
        // 志愿者提交审核
        await request.post(`${MAP_API}/audit`, {
          name: reportForm.name,
          address: reportForm.address,
          lng: reportForm.lng,
          lat: reportForm.lat
        });
        alert('申请已提交，等待审核');
      }

      if ((window as any).tempMarker) {
        (window as any).tempMarker.setMap(null);
        (window as any).tempMarker = null;
      }

      showReportModal.value = false;
      reportForm.name = '';
      reportForm.address = '';
      reportForm.lng = null;
      reportForm.lat = null;

    } catch (e: any) {
      alert(e.response?.data?.message || '操作失败');
    }
  };

  const submitIssue = async () => {
    if (!issueForm.stationId || !issueForm.desc) {
      alert('请选择站点并输入详细说明');
      return;
    }
    try {
      await request.post(`${MAP_API}/report`, {
        stationId: issueForm.stationId,
        type: issueForm.type,
        desc: issueForm.desc
      });
      alert('反馈已提交，管理人员将尽快处理');
      showIssueModal.value = false;
      issueForm.desc = '';
    } catch (e: any) {
      alert(e.response?.data?.message || '提交失败');
    }
  };

  const startNav = (station: any) => {
    if (!userLocation) {
      alert('正在获取您的位置，请稍后重试...');
      // 尝试再次获取位置
      const AMap = (window as any).AMap;
      const geolocation = new AMap.Geolocation();
      geolocation.getCurrentPosition((status: string, result: any) => {
        if (status === 'complete') {
          userLocation = result.position;
          executeNav(station);
        } else {
          alert('获取位置失败，请检查浏览器定位权限');
        }
      });
      return;
    }
    executeNav(station);
  };

  const executeNav = (station: any) => {
    if (!driving) return;
    
    isNavigating.value = true;
    driving.search(
      userLocation,
      [station.lng, station.lat],
      (status: string, result: any) => {
        if (status === 'complete') {
          console.log('导航路径规划成功');
        } else {
          console.error('导航失败:', result);
          alert('导航路径规划失败: ' + result);
        }
      }
    );
  };

  const stopNav = () => {
    if (driving) {
      driving.clear();
      isNavigating.value = false;
    }
  };

  const openExternalMap = (station: any) => {
    const { name, lng, lat } = station;
    // 高德地图 Web URI
    const url = `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car&policy=1&src=pureocean&coordinate=gaode&callnative=1`;
    window.open(url, '_blank');
  };

  const reportFull = async (station: any) => {
    if (confirm(`确定要报告 "${station.name}" 已满吗？`)) {
      try {
        await request.post(`${MAP_API}/report`, {
          stationId: station.id,
          type: 'full',
          desc: '用户快速报告：站点已满'
        });
        alert('感谢您的反馈！');
      } catch (e: any) {
        alert(e.response?.data?.message || '提交失败');
      }
    }
  };

  const editStation = (station: any) => {
    editForm.id = station.id;
    editForm.name = station.name;
    editForm.address = station.address;
    editForm.status = station.status;
    showEditModal.value = true;
  };

  const submitEdit = async () => {
    try {
      await request.put(`${MAP_API}/stations/${editForm.id}`, {
        name: editForm.name,
        address: editForm.address,
        status: editForm.status
      });
      showEditModal.value = false;
      fetchStations();
    } catch (e: any) {
      alert(e.response?.data?.message || '更新失败');
    }
  };

  const deleteStation = (station: any) => {
    deleteTarget.value = station;
    showDeleteModal.value = true;
  };

  const confirmDelete = async () => {
    if (!deleteTarget.value) return;
    try {
      await request.delete(`${MAP_API}/stations/${deleteTarget.value.id}`);
      fetchStations();
      showDeleteModal.value = false;
      deleteTarget.value = null;
    } catch (e: any) {
      alert(e.response?.data?.message || '删除失败');
    }
  };

  const approveAudit = async (audit: any) => {
    try {
      await request.post(`${MAP_API}/audit/${audit.id}/approve`);
      alert('已通过申请并创建新站点');
      fetchAudits();
      fetchStations();
    } catch (e: any) {
      alert(e.response?.data?.message || '操作失败');
    }
  };

  const rejectAudit = async (audit: any) => {
    if (!confirm('确定拒绝该申请吗？')) return;
    try {
      await request.post(`${MAP_API}/audit/${audit.id}/reject`);
      alert('已拒绝该申请');
      fetchAudits();
    } catch (e: any) {
      alert(e.response?.data?.message || '操作失败');
    }
  };

  const resolveReport = async (report: any) => {
    try {
      await request.post(`${MAP_API}/report/${report.id}/resolve`);
      alert('已标记为处理完成');
      fetchReports();
    } catch (e: any) {
      alert(e.response?.data?.message || '操作失败');
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  onMounted(() => {
    initMap();
  });

  onUnmounted(() => {
    if (map) {
      map.destroy();
    }
  });

  return {
    isAdmin,
    showReportModal,
    showIssueModal,
    showAuditModal,
    showErrorListModal,
    showEditModal,
    isPickingLocation,
    loading,
    searchKey,
    reportForm,
    editForm,
    issueForm,
    mockStations,
    pendingAudits,
    pendingCount,
    errorCount,
    errorReports, // Export this for template
    handleSearch,
    focusStation,
    submitReport,
    submitIssue,
    submitEdit,
    startPicking,
    cancelPicking,
    startNav,
    stopNav,
    openExternalMap,
    isNavigating,
    reportFull,
    editStation,
    deleteStation,
    confirmDelete,
    deleteTarget,
    showDeleteModal,
    approveAudit,
    rejectAudit,
    resolveReport,
    formatDate
  };
}
