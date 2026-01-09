import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { store } from '../../stores';

export function useMapLogic() {
  const isAdmin = computed(() => store.isAdmin);

  const showReportModal = ref(false);
  const showIssueModal = ref(false);
  const showAuditModal = ref(false);
  const showErrorListModal = ref(false);
  const isPickingLocation = ref(false);
  const loading = ref(true);
  const searchKey = ref('');

  const reportForm = reactive({
    name: '',
    address: '',
    lng: null as number | null,
    lat: null as number | null
  });

  const issueForm = reactive({
    stationId: null as number | null,
    type: 'full',
    desc: ''
  });

  // 模拟点位数据，增加状态字段
  const mockStations = reactive([
    { id: 1, name: '湛山街道回收站', address: '青岛市延安三路', lng: 120.374, lat: 36.062, status: 'normal', statusText: '正常运行' },
    { id: 2, name: '五四广场回收点', address: '青岛市东海西路', lng: 120.385, lat: 36.064, status: 'full', statusText: '已满' },
    { id: 3, name: '八大关环保站', address: '青岛市正阳关路', lng: 120.352, lat: 36.055, status: 'normal', statusText: '正常运行' }
  ]);

  // 模拟审核数据
  const pendingAudits = reactive([
    { id: 101, user: '张三', name: '新都小区回收点', address: '新都路15号', time: '2023-10-26 14:20' },
    { id: 102, user: '李四', name: '海滨花园站', address: '滨海大道102号', time: '2023-10-26 15:45' }
  ]);

  const pendingCount = computed(() => pendingAudits.length);
  const errorCount = ref(3); // 模拟报错数量

  let map: any = null;
  let geocoder: any = null;
  let placeSearch: any = null;

  const initMap = () => {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: '7b7509159aefd262b8ec05227c8e19da',
    };

    AMapLoader.load({
      key: 'dc05c7a1f7f1312191532da4e379f188',
      version: '2.0',
      plugins: [
        'AMap.Marker',
        'AMap.InfoWindow',
        'AMap.ToolBar',
        'AMap.Scale',
        'AMap.Geolocation',
        'AMap.PlaceSearch',
        'AMap.Geocoder',
        'AMap.AutoComplete'
      ]
    }).then((AMap) => {
      (window as any).AMap = AMap;
      map = new AMap.Map('container', {
        viewMode: '3D',
        zoom: 13,
        center: [120.37, 36.06],
        theme: 'amap://styles/darkblue'
      });

      map.addControl(new AMap.ToolBar({ position: 'RT' }));
      map.addControl(new AMap.Scale());

      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        buttonPosition: 'RB',
        buttonOffset: new AMap.Pixel(10, 20),
        zoomToAccuracy: true,
      });
      map.addControl(geolocation);

      geocoder = new AMap.Geocoder({ city: '全国' });
      placeSearch = new AMap.PlaceSearch({ map: map });

      mockStations.forEach(station => {
        addMarker(station);
      });

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

    marker.on('click', () => {
      const infoWindow = new AMap.InfoWindow({
        content: `<div style="color:#333;padding:10px;min-width:150px;">
          <b style="font-size:14px;">${station.name}</b>
          <p style="margin:5px 0 0;font-size:12px;color:#666;">${station.address}</p>
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
    const station = mockStations.find(s => s.id === id);
    if (station) {
      focusStation(station);
    }
  };

  const focusStation = (station: any) => {
    if (map) {
      map.setZoomAndCenter(15, [station.lng, station.lat]);
    }
  };

  const submitReport = () => {
    if (!reportForm.name || !reportForm.lng || !reportForm.lat) {
      alert('请填写完整信息并选择位置');
      return;
    }
    
    const newStation = {
      id: Date.now(),
      name: reportForm.name,
      address: reportForm.address,
      lng: reportForm.lng!,
      lat: reportForm.lat!,
      status: 'normal',
      statusText: '正常运行'
    };
    
    mockStations.unshift(newStation);
    addMarker(newStation);
    
    if ((window as any).tempMarker) {
      (window as any).tempMarker.setMap(null);
      (window as any).tempMarker = null;
    }
    
    showReportModal.value = false;
    reportForm.name = '';
    reportForm.address = '';
    reportForm.lng = null;
    reportForm.lat = null;
  };

  const submitIssue = () => {
    if (!issueForm.stationId || !issueForm.desc) {
      alert('请选择站点并输入详细说明');
      return;
    }
    alert('报错已提交，管理人员将尽快处理');
    showIssueModal.value = false;
    issueForm.desc = '';
  };

  const startNav = (station: any) => {
    alert(`正在唤起导航前往: ${station.name}`);
  };

  const reportFull = (station: any) => {
    if (confirm(`确定要报告 "${station.name}" 已满吗？`)) {
      station.status = 'full';
      station.statusText = '已满';
      alert('感谢您的反馈！');
    }
  };

  const editStation = (station: any) => {
    alert(`编辑站点: ${station.name}`);
  };

  const deleteStation = (station: any) => {
    if (confirm(`确定要删除站点 "${station.name}" 吗？`)) {
      const index = mockStations.findIndex(s => s.id === station.id);
      if (index > -1) mockStations.splice(index, 1);
    }
  };

  const approveAudit = (audit: any) => {
    const newStation = {
      id: Date.now(),
      name: audit.name,
      address: audit.address,
      lng: 120.37 + Math.random() * 0.05,
      lat: 36.06 + Math.random() * 0.05,
      status: 'normal',
      statusText: '正常运行'
    };
    mockStations.push(newStation);
    const index = pendingAudits.findIndex(a => a.id === audit.id);
    if (index > -1) pendingAudits.splice(index, 1);
    alert('已通过申请并创建新站点');
  };

  const rejectAudit = (audit: any) => {
    const index = pendingAudits.findIndex(a => a.id === audit.id);
    if (index > -1) pendingAudits.splice(index, 1);
    alert('已拒绝该申请');
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
    isPickingLocation,
    loading,
    searchKey,
    reportForm,
    issueForm,
    mockStations,
    pendingAudits,
    pendingCount,
    errorCount,
    handleSearch,
    focusStation,
    submitReport,
    submitIssue,
    startPicking,
    cancelPicking,
    startNav,
    reportFull,
    editStation,
    deleteStation,
    approveAudit,
    rejectAudit
  };
}
