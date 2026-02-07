import {useRef, useState, useEffect, useCallback} from "react";
import {WebView} from "react-native-webview";
import Geolocation from "@react-native-community/geolocation";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import {deviceStore} from "@/stores/deviceStore";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {showCustomToast} from "@/components/common/CustomToast";
import useOptimizedHeading from "@/hooks/useOptimizedHeading";
import {MapWebviewMessage} from "@/types/land";

// 定义Hook的入参类型
export type UseMapCoreProps = {
  webViewRef: React.RefObject<WebView | null>; // WebView的ref，从组件传入
  onWebViewReady?: () => void; // WebView就绪后的回调，供组件做后续操作
};

// 定义Hook的返回类型
export type UseMapCoreReturn = {
  // 状态
  showMapSwitcher: boolean;
  showPermissionPopup: boolean;
  isWebViewReady: boolean;
  hasLocationPermission: boolean;
  useLocationFromSocket: boolean;
  rtkLocation: {lat: number; lon: number};
  // 方法
  onToggleMapLayer: () => void;
  handleSelectMap: ({type, layerUrl}: {type: string; layerUrl: string}) => void;
  onLocatePosition: () => Promise<void>;
  handleAcceptPermission: () => Promise<void>;
  handleRejectPermission: () => void;
  switchMapLayer: (layerType: string, layerUrl?: string) => void;
  startPositionWatch: () => Promise<void>;
  stopPositionWatch: () => void;
  locateDevicePosition: (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => Promise<void>;
  handleWebviewMessage: (data: MapWebviewMessage) => void;
  setShowMapSwitcher: (show: boolean) => void;
  setUseLocationFromSocket: (use: boolean) => void;
  setRtkLocation: (location: {lat: number; lon: number}) => void;
  initLocationByDeviceStatus: () => void; // 供组件监听设备状态时调用
  getLocationService: () => Promise<void>; // 初始化定位服务
};

const useMapCore = ({webViewRef, onWebViewReady}: UseMapCoreProps): UseMapCoreReturn => {
  // 地图&定位相关状态
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [useLocationFromSocket, setUseLocationFromSocket] = useState(false);
  const [rtkLocation, setRtkLocation] = useState<{lat: number; lon: number}>({lat: 0, lon: 0});

  // 定位相关ref（持久化状态，不触发重渲染）
  const watchIdRef = useRef<number | null>(null);
  const isFirstLocationRef = useRef(true);
  const locationLngLatRef = useRef<{longitude: number; latitude: number} | null>(null);

  // 1. 初始化定位权限
  useEffect(() => {
    const initLocationPermission = async () => {
      const granted = await checkLocationPermission();
      if (granted) {
        setHasLocationPermission(true);
        if (!(deviceStore.deviceImei && deviceStore.status === "1")) {
          initLocationByDeviceStatus();
        }
      } else {
        setShowPermissionPopup(true);
      }
    };
    initLocationPermission();
  }, []);

  // 2. WebView就绪后执行：应用地图图层、初始化定位
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
      initLocationByDeviceStatus();
      onWebViewReady?.(); // 执行组件的回调
    }
  }, [isWebViewReady, mapStore.mapType, deviceStore.status, onWebViewReady]);

  // 3. 监听设备状态变化，切换定位源（组件也可手动调用initLocationByDeviceStatus）
  useEffect(() => {
    initLocationByDeviceStatus();
  }, [deviceStore.status, hasLocationPermission, isWebViewReady]);

  // 4. 监听朝向变化，发送给WebView（和原逻辑一致）
  useOptimizedHeading(heading => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "UPDATE_MARKER_ROTATION",
        rotation: heading,
      }),
    );
  });

  // 应用本地保存的地图类型（天地图电子/卫星/自定义）
  const applySavedMapType = useCallback(() => {
    switch (mapStore.mapType) {
      case "标准地图":
        switchMapLayer("TIANDITU_ELEC");
        break;
      case "卫星地图":
        switchMapLayer("TIANDITU_SAT");
        break;
      case "自定义":
        switchMapLayer("CUSTOM", mapStore.customMapLayer);
        break;
      default:
        switchMapLayer("TIANDITU_SAT");
    }
  }, []);

  // 切换地图图层（核心方法，给WebView发消息）
  const switchMapLayer = useCallback(
    (layerType: string, layerUrl?: string) => {
      if (!isWebViewReady) return;
      const message = {type: "SWITCH_LAYER", layerType};
      if (layerType === "CUSTOM" && layerUrl) {
        (message as any).customUrl = layerUrl;
      }
      webViewRef.current?.postMessage(JSON.stringify(message));
    },
    [isWebViewReady],
  );

  // 打开图层切换弹窗
  const onToggleMapLayer = useCallback(() => {
    setShowMapSwitcher(true);
  }, []);

  // 处理图层选择（弹窗确认后）
  const handleSelectMap = useCallback(
    ({type, layerUrl}: {type: string; layerUrl: string}) => {
      mapStore.setMapType(type);
      if (type === "自定义" && layerUrl) {
        mapStore.setCustomMapType(layerUrl);
      }
      // 执行图层切换逻辑
      switch (type) {
        case "标准地图":
          switchMapLayer("TIANDITU_ELEC");
          break;
        case "卫星地图":
          switchMapLayer("TIANDITU_SAT");
          break;
        case "自定义":
          if (layerUrl) {
            switchMapLayer("CUSTOM", layerUrl);
          } else {
            showCustomToast("error", "请输入有效的自定义图层URL");
          }
          break;
        default:
          break;
      }
      setShowMapSwitcher(false);
    },
    [switchMapLayer],
  );

  // 定位设备位置（给WebView发定位消息）
  const locateDevicePosition = useCallback(async (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
    if (deviceStore.deviceImei && deviceStore.status === "1") return;
    if (isShowIcon) {
      await Geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
      });
    } else if (coordinate) {
      webViewRef.current?.postMessage(JSON.stringify({type: "SET_LOCATION", location: coordinate}));
    }
  }, []);

  // 初始化定位服务（IP定位/GPS定位）
  const getLocationService = useCallback(async () => {
    if (deviceStore.deviceImei && deviceStore.status === "1") return;
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      await locateDevicePosition(true);
    } else {
      await getLocationByIP();
    }
  }, [locateDevicePosition]);

  // IP定位（无权限时的兜底方案）
  const getLocationByIP = useCallback(async () => {
    try {
      const response = await fetch("http://ip-api.com/json/");
      const data = await response.json();
      if (data.status === "success") {
        const {lat, lon} = data;
        await locateDevicePosition(false, {lon, lat});
      }
    } catch (error) {
      showCustomToast("error", "IP定位失败");
    }
  }, [locateDevicePosition]);

  // 手动点击定位按钮
  const onLocatePosition = useCallback(async () => {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }
    if (useLocationFromSocket) {
      // 从Socket获取定位时，直接使用已有的rtkLocation
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "SET_ICON_LOCATION",
          location: rtkLocation,
        }),
      );
      return;
    }
    await locateDevicePosition(true);
  }, [useLocationFromSocket, rtkLocation, locateDevicePosition]);

  // 同意定位权限
  const handleAcceptPermission = useCallback(async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      setShowPermissionPopup(false);
      initLocationByDeviceStatus();
    }
  }, []);

  // 拒绝定位权限（兜底IP定位）
  const handleRejectPermission = useCallback(async () => {
    await getLocationByIP();
    setShowPermissionPopup(false);
  }, [getLocationByIP]);

  // 停止GPS持续定位
  const stopPositionWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current as any);
      watchIdRef.current = null;
    }
  }, []);

  // 开启GPS持续定位（watchPosition）
  const startPositionWatch = useCallback(async () => {
    if (deviceStore.deviceImei && deviceStore.status === "1") return;
    stopPositionWatch(); // 先停止原有定位，防止重复监听

    // 首次定位（初始化图标位置）
    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        if (!useLocationFromSocket) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SET_ICON_LOCATION",
              location: {lon: longitude, lat: latitude},
            }),
          );
          locationLngLatRef.current = {longitude, latitude};
        }
        isFirstLocationRef.current = false;
      },
      () => {},
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
    );

    // 持续定位（更新图标位置）
    const watchId = Geolocation.watchPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        locationLngLatRef.current = {longitude, latitude};
        if (!useLocationFromSocket) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "UPDATE_ICON_LOCATION",
              location: {lon: longitude, lat: latitude},
            }),
          );
        }
      },
      err => {
        console.error("watchPosition 错误:", err);
        if (err.code === 1) showCustomToast("error", "定位权限被拒绝");
        else if (err.code === 2) showCustomToast("error", "位置不可用");
        else if (err.code === 3) showCustomToast("error", "定位超时");
      },
      {enableHighAccuracy: true, distanceFilter: 1, interval: 1000, fastestInterval: 500},
    );
    watchIdRef.current = watchId as any;
  }, [useLocationFromSocket, stopPositionWatch]);

  // 根据设备状态初始化定位源（核心联动逻辑：设备在线用Socket，离线/无设备用GPS）
  const initLocationByDeviceStatus = useCallback(() => {
    if (!isWebViewReady) return;

    // 设备已绑定且在线：使用Socket定位，停止GPS
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      setUseLocationFromSocket(true);
      stopPositionWatch();
      isFirstLocationRef.current = true;
      // 已有Socket定位数据，直接更新地图
      if (rtkLocation.lat !== 0 && rtkLocation.lon !== 0) {
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_ICON_LOCATION",
            location: {lon: rtkLocation.lon, lat: rtkLocation.lat},
          }),
        );
      }
      return;
    }

    // 设备已绑定但离线：切换GPS定位
    if (deviceStore.deviceImei && deviceStore.status === "2") {
      console.log("设备离线，切换到GPS定位");
      setUseLocationFromSocket(false);
      if (hasLocationPermission) startPositionWatch();
      else console.log("设备离线但无定位权限，暂不启动GPS定位");
      return;
    }

    // 无设备：默认GPS定位
    setUseLocationFromSocket(false);
    if (hasLocationPermission) startPositionWatch();
  }, [
    isWebViewReady,
    deviceStore.deviceImei,
    deviceStore.status,
    rtkLocation,
    hasLocationPermission,
    startPositionWatch,
    stopPositionWatch,
  ]);

  // 处理WebView发来的消息（核心：监听WEBVIEW_READY）
  const handleWebviewMessage = useCallback(
    (data: MapWebviewMessage) => {
      switch (data.type) {
        case "WEBVIEW_READY":
          setIsWebViewReady(true);
          // WebView就绪后，若有定位权限且非设备在线，直接定位
          if (hasLocationPermission && !(deviceStore.deviceImei && deviceStore.status === "1")) {
            locateDevicePosition(true);
          }
          break;
        case "WEBVIEW_ERROR":
          showCustomToast("error", data.message ?? "操作失败");
          break;
        case "WEBVIEW_CONSOLE_LOG":
          console.log("WEBVIEW_CONSOLE_LOG", data);
          break;
        default:
          break;
      }
    },
    [hasLocationPermission, locateDevicePosition],
  );

  return {
    // 状态
    showMapSwitcher,
    showPermissionPopup,
    isWebViewReady,
    hasLocationPermission,
    useLocationFromSocket,
    rtkLocation,
    // 方法
    onToggleMapLayer,
    handleSelectMap,
    onLocatePosition,
    handleAcceptPermission,
    handleRejectPermission,
    switchMapLayer,
    startPositionWatch,
    stopPositionWatch,
    locateDevicePosition,
    handleWebviewMessage,
    // 手动设置状态的方法（供组件外部修改）
    setShowMapSwitcher,
    setUseLocationFromSocket,
    setRtkLocation,
    // 核心联动方法（供组件监听）
    initLocationByDeviceStatus,
    getLocationService,
  };
};

export default useMapCore;
