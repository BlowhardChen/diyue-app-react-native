import {useRef, useState, useEffect, useCallback} from "react";
import {WebView} from "react-native-webview";
import {deviceStore} from "@/stores/deviceStore";
import {mapStore} from "@/stores/mapStore";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import Geolocation from "@react-native-community/geolocation";
import {showCustomToast} from "@/components/common/CustomToast";
import WebSocketClass from "@/utils/webSocketClass";
import useOptimizedHeading from "./useOptimizedHeading";
import {getToken} from "@/utils/tokenUtils";

interface UseMapOptions {
  onLocationUpdate?: (location: {lat: number; lon: number}) => void;
  onMapReady?: () => void;
}

interface UseMapReturn {
  // 状态
  webViewRef: React.RefObject<WebView | null>;
  isWebViewReady: boolean;
  hasLocationPermission: boolean;
  showPermissionPopup: boolean;
  useLocationFromSocket: boolean;
  rtkLocation: {lat: number; lon: number};

  // 方法
  setIsWebViewReady: (ready: boolean) => void;
  handleAcceptPermission: () => Promise<void>;
  handleRejectPermission: () => Promise<void>;
  onLocatePosition: () => Promise<void>;
  switchMapLayer: (layerType: string, layerUrl?: string) => void;
  applySavedMapType: () => void;
  handleSelectMap: ({type, layerUrl}: {type: string; layerUrl: string}) => void;
  handleSelectMapLayer: (type: string, layerUrl: string) => void;
  sendMessageToWebView: (message: any) => void;
  initWebSocket: () => Promise<void>;
  closeWebSocket: () => void;
}

export const useMap = (options: UseMapOptions = {}): UseMapReturn => {
  const {onLocationUpdate, onMapReady} = options;

  // 状态定义
  const webViewRef = useRef<WebView | null>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [useLocationFromSocket, setUseLocationFromSocket] = useState(false);
  const [rtkLocation, setRtkLocation] = useState<{lat: number; lon: number}>({lat: 0, lon: 0});

  // 引用
  const watchIdRef = useRef<number | null>(null);
  const webSocketRef = useRef<WebSocketClass | null>(null);
  const isFirstLocationRef = useRef(true);
  const isFirstSocketLocationRef = useRef(true);

  // 初始化定位权限
  useEffect(() => {
    initLocationPermission();
  }, []);

  // WebView准备好时的处理
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
      initLocationByDeviceStatus();
      onMapReady?.();
    }
  }, [isWebViewReady, mapStore.mapType, deviceStore.status]);

  // 监听设备状态变化，切换定位源
  useEffect(() => {
    initLocationByDeviceStatus();
  }, [deviceStore.status, hasLocationPermission, isWebViewReady]);

  // 监听朝向变化，发送给WebView
  useOptimizedHeading(heading => {
    sendMessageToWebView({
      type: "UPDATE_MARKER_ROTATION",
      rotation: heading,
    });
  });

  // 初始化定位权限
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

  // 根据设备状态初始化定位源
  const initLocationByDeviceStatus = useCallback(() => {
    if (!isWebViewReady) return;

    // 若有绑定设备且设备在线：优先使用 WebSocket 定位
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      setUseLocationFromSocket(true);
      stopPositionWatch();
      isFirstLocationRef.current = true;

      // 优先使用已有RTK坐标绘制
      if (rtkLocation.lat !== 0 && rtkLocation.lon !== 0) {
        sendMessageToWebView({
          type: "SET_ICON_LOCATION",
          location: {lon: rtkLocation.lon, lat: rtkLocation.lat},
        });
      }
      return;
    }

    // 如果有绑定设备但设备离线：使用 GPS
    if (deviceStore.deviceImei && deviceStore.status === "2") {
      console.log("设备离线，切换到GPS定位");
      setUseLocationFromSocket(false);
      if (hasLocationPermission) {
        startPositionWatch();
      }
      return;
    }

    // 未绑定设备：走手机GPS逻辑
    setUseLocationFromSocket(false);
    if (hasLocationPermission) {
      startPositionWatch();
    }
  }, [isWebViewReady, hasLocationPermission, rtkLocation]);

  // 启动GPS定位
  const startPositionWatch = useCallback(() => {
    stopPositionWatch(); // 先停止之前的定位

    watchIdRef.current = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const location = {lat: latitude, lon: longitude};

        sendMessageToWebView({
          type: "SET_ICON_LOCATION",
          location,
        });

        if (isFirstLocationRef.current) {
          isFirstLocationRef.current = false;
        }

        onLocationUpdate?.(location);
      },
      error => {
        console.error("GPS定位错误:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      },
    );
  }, [onLocationUpdate]);

  // 停止GPS定位
  const stopPositionWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // 初始化WebSocket
  const initWebSocket = useCallback(async () => {
    // 只有当有设备IMEI时才初始化WebSocket
    if (!deviceStore.deviceImei) return;

    try {
      const token = await getToken();

      webSocketRef.current = new WebSocketClass({
        data: {
          token,
          imei: deviceStore.deviceImei,
        },
        onConnected: () => {
          console.log("WebSocket连接成功");
        },
        onMessage: (message: any) => {
          try {
            // 处理定位数据
            if (message.type === "location" && message.data) {
              const {lat, lon} = message.data;
              if (lat && lon) {
                const location = {lat, lon};
                setRtkLocation(location);

                sendMessageToWebView({
                  type: "SET_ICON_LOCATION",
                  location,
                });

                if (isFirstSocketLocationRef.current) {
                  isFirstSocketLocationRef.current = false;
                }

                onLocationUpdate?.(location);
              }
            }
          } catch (error) {
            console.error("WebSocket消息解析错误:", error);
          }
        },
        onError: (error: Error) => {
          console.error("WebSocket错误:", error);
        },
      });
    } catch (error) {
      console.error("WebSocket初始化错误:", error);
    }
  }, []);

  // 关闭WebSocket
  const closeWebSocket = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
  }, []);

  // 应用保存的地图类型
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

  // 切换地图图层
  const switchMapLayer = useCallback(
    (layerType: string, layerUrl?: string) => {
      if (!isWebViewReady) return;

      const message: any = {
        type: "SWITCH_LAYER",
        layerType,
      };

      if (layerType === "CUSTOM" && layerUrl) {
        message.customUrl = layerUrl;
      }

      sendMessageToWebView(message);
    },
    [isWebViewReady],
  );

  // 处理地图选择
  const handleSelectMap = useCallback(({type, layerUrl}: {type: string; layerUrl: string}) => {
    mapStore.setMapType(type);
    if (type === "自定义" && layerUrl) {
      mapStore.setCustomMapType(layerUrl);
    }

    handleSelectMapLayer(type, layerUrl);
  }, []);

  // 处理地图图层选择逻辑
  const handleSelectMapLayer = useCallback(
    (type: string, layerUrl: string) => {
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
    },
    [switchMapLayer],
  );

  // 手动触发定位
  const onLocatePosition = useCallback(async () => {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }

    // 如果是WebSocket定位模式
    if (useLocationFromSocket) {
      sendMessageToWebView({
        type: "SET_ICON_LOCATION",
        location: rtkLocation,
      });
      return;
    }

    // GPS定位模式手动触发一次定位
    locateDevicePosition(true);
  }, [useLocationFromSocket, rtkLocation]);

  // 定位设备位置
  const locateDevicePosition = useCallback(
    async (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
      // 设备在线时，直接返回
      if (deviceStore.deviceImei && deviceStore.status === "1") {
        return;
      }
      if (isShowIcon) {
        await Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            const location = {lon: longitude, lat: latitude};

            sendMessageToWebView({
              type: "SET_ICON_LOCATION",
              location,
            });

            onLocationUpdate?.(location);
          },
          error => {
            console.error("GPS定位错误:", error);
            getLocationByIP();
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000,
          },
        );
      } else if (coordinate) {
        sendMessageToWebView({
          type: "SET_ICON_LOCATION",
          location: coordinate,
        });

        onLocationUpdate?.(coordinate);
      }
    },
    [onLocationUpdate],
  );

  // 通过IP定位
  const getLocationByIP = useCallback(async () => {
    try {
      const response = await fetch("http://ip-api.com/json/");
      const data = await response.json();
      if (data.status === "success") {
        const {lat, lon} = data;
        locateDevicePosition(false, {lon, lat});
      }
    } catch (error) {
      showCustomToast("error", "IP定位失败");
    }
  }, [locateDevicePosition]);

  // 同意定位权限
  const handleAcceptPermission = useCallback(async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      setShowPermissionPopup(false);
      initLocationByDeviceStatus();
    }
  }, [initLocationByDeviceStatus]);

  // 拒绝定位权限
  const handleRejectPermission = useCallback(async () => {
    await getLocationByIP();
    setShowPermissionPopup(false);
  }, [getLocationByIP]);

  // 发送消息到WebView
  const sendMessageToWebView = useCallback(
    (message: any) => {
      if (isWebViewReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify(message));
      }
    },
    [isWebViewReady],
  );

  // 清理函数
  useEffect(() => {
    return () => {
      stopPositionWatch();
      closeWebSocket();
    };
  }, [stopPositionWatch, closeWebSocket]);

  return {
    webViewRef,
    isWebViewReady,
    hasLocationPermission,
    showPermissionPopup,
    useLocationFromSocket,
    rtkLocation,
    setIsWebViewReady,
    handleAcceptPermission,
    handleRejectPermission,
    onLocatePosition,
    switchMapLayer,
    applySavedMapType,
    handleSelectMap,
    handleSelectMapLayer,
    sendMessageToWebView,
    initWebSocket,
    closeWebSocket,
  };
};

export default useMap;
