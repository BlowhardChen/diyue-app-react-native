// 点回找
import PermissionPopup from "@/components/common/PermissionPopup";
import {mapStore} from "@/stores/mapStore";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {useEffect, useRef, useState} from "react";
import {View, Image, Text, TouchableOpacity, PermissionsAndroid} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import {showCustomToast} from "@/components/common/CustomToast";
import WebView from "react-native-webview";
import {MapWebviewMessage} from "@/types/land";
import {observer} from "mobx-react-lite";
import KeepAwake from "react-native-keep-awake";
import {useFocusEffect, useNavigation, useRoute} from "@react-navigation/native";
import {deviceStore} from "@/stores/deviceStore";
import {FindPointScreenStyles} from "./styles/FindPointScreen";
import DeviceConnectionPopup from "@/components/device/DeviceConnectionPopup";
import {saveTargetRoute} from "@/utils/navigationUtils";
import {getRtkPopupStatus, setRtkPopupTips} from "@/services/device";
import WebSocketClass from "@/utils/webSocketClass";
import React from "react";
import {getToken} from "@/utils/tokenUtils";
import Compass from "./components/Compass";

const FindPointScreen = observer(({route}: {route: {params: {point: {lat: number; lon: number}}}}) => {
  const watchIdRef = useRef<number | null>(null);
  const webViewRef = useRef<WebView>(null);
  const isFirstLocationRef = useRef(true);
  const navigation = useNavigation();
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({lon: 0, lat: 0});
  const [isNavigationPolylineComplete, setIsNavigationPolylineComplete] = useState(false);
  const [showDeviceConnectionPopup, setShowDeviceConnectionPopup] = useState(false);
  const router = useRoute();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const webSocketRef = useRef<WebSocketClass | null>(null);
  const [useLocationFromSocket, setUseLocationFromSocket] = useState(false);
  const isFirstSocketLocationRef = useRef(true);
  const [mapRotation, setMapRotation] = useState(0);

  // 启用屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  useEffect(() => {
    setDeviceConnectionPopup();
  }, []);

  // 初始化定位服务
  useEffect(() => {
    getLocationService();
  }, []);

  // 初始化定位权限
  useEffect(() => {
    initLocationPermission();
  }, []);

  // 当WebView准备好时
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
      // WebView准备好后，根据当前设备状态初始化定位
      initLocationByDeviceStatus();
    }
  }, [isWebViewReady, mapStore.mapType, deviceStore.status]);

  // 页面聚焦时：启动WebSocket连接（无论设备状态）
  useFocusEffect(
    React.useCallback(() => {
      // 初始化WebSocket（不管设备是否在线）
      initWebSocket();

      // 根据当前设备状态初始化定位源
      initLocationByDeviceStatus();

      // 页面失焦时：关闭WebSocket + 停止GPS
      return () => {
        if (webSocketRef.current) {
          webSocketRef.current.close();
          webSocketRef.current = null;
        }
        stopPositionWatch();
      };
    }, [hasLocationPermission, isWebViewReady, deviceStore.deviceImei]),
  );

  // 监听设备状态变化，切换定位源
  useEffect(() => {
    initLocationByDeviceStatus();
  }, [deviceStore.status, hasLocationPermission, isWebViewReady]);

  useEffect(() => {
    if (!isNavigationPolylineComplete) return;
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "UPDATE_FIND_NAVIGATION_POLYLINE",
        data: {
          locationPoint: currentLocation,
          findPoint: route.params.point,
        },
      }),
    );
  }, [currentLocation]);

  // 初始化定位权限和地图图层
  const initLocationPermission = async () => {
    const granted = await checkLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      // 设备在线时，无需初始化GPS（WebSocket会处理）
      if (!(deviceStore.deviceImei && deviceStore.status === "1")) {
        initLocationByDeviceStatus();
      }
    } else {
      setShowPermissionPopup(true);
    }
  };

  // 根据设备状态初始化定位源
  const initLocationByDeviceStatus = () => {
    // 如果WebView没准备好，先等WebView准备
    if (!isWebViewReady) {
      return;
    }

    // 若有绑定设备且设备在线：优先使用 WebSocket 定位（忽略手机定位权限）
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      setUseLocationFromSocket(true);
      stopPositionWatch(); // 停止GPS定位
      isFirstLocationRef.current = true; // 重置GPS首次定位标记，避免残留

      // 优先使用已有RTK坐标绘制
      if (currentLocation.lat !== 0 && currentLocation.lon !== 0) {
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_ICON_LOCATION",
            location: {lon: currentLocation.lon, lat: currentLocation.lat},
          }),
        );
      }
      return;
    }

    // 如果有绑定设备但设备离线：使用 GPS（仍需手机定位权限）
    if (deviceStore.deviceImei && deviceStore.status === "2") {
      console.log("设备离线，切换到GPS定位");
      setUseLocationFromSocket(false);
      if (hasLocationPermission) {
        startPositionWatch();
      } else {
        console.log("设备离线但无定位权限，暂不启动GPS定位");
      }
      return;
    }

    // 未绑定设备：走手机GPS逻辑（需要定位权限）
    setUseLocationFromSocket(false);
    if (hasLocationPermission) {
      startPositionWatch();
    }
  };

  // 应用保存的地图类型
  const applySavedMapType = () => {
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
  };

  // 切换地图图层
  const switchMapLayer = (layerType: string, layerUrl?: string) => {
    if (!isWebViewReady) return;

    const message = {
      type: "SWITCH_LAYER",
      layerType,
    };

    // 只有自定义图层才添加layerUrl属性
    if (layerType === "CUSTOM" && layerUrl) {
      (message as any).customUrl = layerUrl;
    }

    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  // 获取定位服务
  const getLocationService = async () => {
    // 设备在线时，直接返回，不执行任何GPS/IP定位初始化
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      return;
    }
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      locateDevicePosition(true);
    } else {
      getLocationByIP();
    }
  };

  // 通过IP定位
  const getLocationByIP = async () => {
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
  };

  // 定位设备位置
  const locateDevicePosition = async (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
    // 设备在线时，直接返回，不执行任何GPS定位绘制
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      return;
    }
    if (isShowIcon) {
      await Geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({lon: longitude, lat: latitude});
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
  };

  // 开启定位
  const startPositionWatch = async () => {
    // 设备在线时，直接返回，不启动任何GPS相关逻辑
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      return;
    }
    stopPositionWatch();

    // 初始定位（无论定位源，先获取一次位置）
    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        setCurrentLocation({lon: longitude, lat: latitude});
        // 仅当定位源为GPS时，才更新WebView
        if (!useLocationFromSocket) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SET_ICON_LOCATION",
              location: {lon: longitude, lat: latitude},
            }),
          );
        }
        isFirstLocationRef.current = false;
      },
      () => {},
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
    );

    const watchId = Geolocation.watchPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        setCurrentLocation({lon: longitude, lat: latitude});
        // 仅当定位源为GPS（useLocationFromSocket=false）时，才更新定位图标
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
        if (err.code === 1) {
          showCustomToast("error", "定位权限被拒绝");
        } else if (err.code === 2) {
          showCustomToast("error", "位置不可用");
        } else if (err.code === 3) {
          showCustomToast("error", "定位超时");
        }
      },
      {enableHighAccuracy: true, distanceFilter: 1, interval: 1000, fastestInterval: 500},
    );

    watchIdRef.current = watchId as any;
  };

  // 停止定位
  const stopPositionWatch = () => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current as any);
      watchIdRef.current = null;
    }
  };

  // 同意定位权限
  const handleAcceptPermission = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      setShowPermissionPopup(false);
      // 权限获取后，根据设备状态初始化定位
      initLocationByDeviceStatus();
    }
  };

  // 拒绝定位权限
  const handleRejectPermission = () => {
    getLocationByIP();
    setShowPermissionPopup(false);
  };

  // 返回上一页
  const onBack = () => {
    navigation.goBack();
  };

  // 连接设备
  const handleConnectDevice = () => {
    saveTargetRoute(router.name);
    navigation.navigate("AddDevice" as never);
  };

  // 处理取消提醒
  const handleAbortRemind = async () => {
    await setRtkPopupTips({});
    setShowDeviceConnectionPopup(false);
  };

  // 设置设备连接弹窗
  const setDeviceConnectionPopup = async () => {
    const {data} = await getRtkPopupStatus({});
    if (data.status) {
      setShowDeviceConnectionPopup(false);
    } else if (deviceStore.status === "1") {
      setShowDeviceConnectionPopup(false);
    } else {
      setShowDeviceConnectionPopup(true);
    }
  };

  // 初始化WebSocket（无论设备状态，都建立连接）
  const initWebSocket = async () => {
    console.log("初始化WebSocket（无论设备状态）");
    if (!deviceStore.deviceImei) {
      return;
    }

    const token = await getToken();

    // 如果已有连接，先关闭
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    // 建立新连接
    webSocketRef.current = new WebSocketClass({
      data: {token, imei: deviceStore.deviceImei},
      onConnected: () => {
        console.log("WebSocket 连接成功");
        if (currentLocation.lat !== 0 && currentLocation.lon !== 0) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SET_ICON_LOCATION",
              location: {lon: currentLocation.lon, lat: currentLocation.lat},
            }),
          );
        }
        initLocationByDeviceStatus();
      },
      onMessage: (data: any) => {
        const socketData = JSON.parse(JSON.stringify(data));
        console.log("收到WebSocket消息:", socketData);
        // 过滤无效坐标（避免0,0坐标）
        if (socketData.taskType === "1" && socketData.lng && socketData.lat && socketData.lng !== 0 && socketData.lat !== 0) {
          const newLocation = {lon: socketData.lng, lat: socketData.lat};
          setCurrentLocation(newLocation); // 更新状态
          console.log("WebSocket 接收定位数据:", newLocation);

          // 关键修改：首次定位用 SET_ICON_LOCATION（带居中），后续用 UPDATE_ICON_LOCATION（不带居中）
          const messageType = isFirstSocketLocationRef.current ? "SET_ICON_LOCATION" : "UPDATE_ICON_LOCATION";

          webViewRef.current?.postMessage(
            JSON.stringify({
              type: messageType,
              location: newLocation,
            }),
          );

          // 首次接收RTK数据时，主动重绘导航线段（修复初始错误起点）
          if (isFirstSocketLocationRef.current) {
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: "DRAW_FIND_NAVIGATION_POLYLINE",
                data: {
                  locationPoint: newLocation, // 用真实RTK坐标作为起点
                  findPoint: {lon: Number(route.params.point.lon), lat: Number(route.params.point.lat)},
                },
              }),
            );
            isFirstSocketLocationRef.current = false;
          }
        }

        // 处理设备状态变更
        if (socketData.deviceStatus === "2") {
          deviceStore.listenDeviceStatus("2");
          setUseLocationFromSocket(false); // 切换到GPS定位
          startPositionWatch(); // 启动GPS
          return;
        } else if (socketData.deviceStatus === "1") {
          deviceStore.listenDeviceStatus("1");
          setUseLocationFromSocket(true); // 切换到WebSocket定位
          stopPositionWatch(); // 停止GPS
        }
      },
      onError: error => {
        // 错误时，默认切换到GPS定位
        setUseLocationFromSocket(false);
        startPositionWatch();
      },
    });
  };

  // 接收WebView消息
  const receiveWebviewMessage = (event: any) => {
    console.log("📬 接收WebView消息:", event.nativeEvent.data);
    let data = event.nativeEvent?.data;
    if (!data) return;
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    if (data && data.type) handleWebviewMessage(data);
  };

  // 处理webview消息
  const handleWebviewMessage = async (data: MapWebviewMessage) => {
    switch (data.type) {
      // 地图准备完成
      case "WEBVIEW_READY":
        setIsWebViewReady(true);
        initLocationByDeviceStatus();
        break;
      case "WEBVIEW_LOCATE_SELF":
        const isValidLocation = currentLocation.lon !== 0 && currentLocation.lat !== 0;
        // 设备在线时，即使坐标无效也不绘制（等待WebSocket数据）；设备离线/GPS模式则正常绘制（允许IP/GPS初始化）
        if (isValidLocation || !(deviceStore.deviceImei && deviceStore.status === "1")) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "DRAW_FIND_NAVIGATION_POLYLINE",
              data: {
                locationPoint: currentLocation,
                findPoint: {lon: Number(route.params.point.lon), lat: Number(route.params.point.lat)},
              },
            }),
          );
        }
        break;
      // 地图旋转事件
      case "WEBVIEW_MAP_ROTATE":
        setMapRotation(Number(data.rotation) * (180 / Math.PI));
        break;
      // 导航线段绘制完成事件
      case "WEBVIEW_NAVIGATION_POLYLINE_COMPLETE":
        setIsNavigationPolylineComplete(true);
        break;
      // 控制台日志
      case "WEBVIEW_CONSOLE_LOG":
        console.log("WEBVIEW_CONSOLE_LOG", data);
        break;
      default:
        break;
    }
  };

  return (
    <View style={FindPointScreenStyles.container}>
      <Compass mapRotate={mapRotation} />
      {/* 地图 */}
      <View style={FindPointScreenStyles.mapBox}>
        <View style={FindPointScreenStyles.map} collapsable={false}>
          <WebView
            ref={webViewRef}
            source={{uri: "file:///android_asset/web/map.html"}}
            originWhitelist={["*"]}
            mixedContentMode="always"
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowsInlineMediaPlayback
            onMessage={receiveWebviewMessage}
            style={{flex: 1}}
          />
          <View style={FindPointScreenStyles.mapCopyright}>
            <Image source={require("@/assets/images/home/icon-td.png")} style={FindPointScreenStyles.iconImg} />
            <Text style={FindPointScreenStyles.copyrightText}>
              ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
            </Text>
          </View>
        </View>
      </View>
      {/* 设备连接状态弹窗 */}
      <View style={FindPointScreenStyles.devicePopupContainer}>
        <View style={FindPointScreenStyles.deviceHeader}>
          <TouchableOpacity style={FindPointScreenStyles.headerBack} onPress={onBack}>
            <Image source={require("@/assets/images/common/icon-back.png")} style={FindPointScreenStyles.backIcon} />
          </TouchableOpacity>
          <Text style={FindPointScreenStyles.deviceTitle}>设备连接状态</Text>
          <View style={FindPointScreenStyles.headerBack}></View>
        </View>
        <View style={FindPointScreenStyles.deviceContent}>
          <View
            style={[
              FindPointScreenStyles.deviceContentContainer,
              {backgroundColor: deviceStore.status === "1" ? "#ebffe4" : "#FFF0EE"},
            ]}>
            <TouchableOpacity style={FindPointScreenStyles.headerBack} onPress={handleConnectDevice}>
              <Image
                source={
                  deviceStore.status === "1"
                    ? require("@/assets/images/common/device-connect.png")
                    : require("@/assets/images/common/device-disconnect.png")
                }
                style={FindPointScreenStyles.backIcon}
              />
            </TouchableOpacity>
            <Text style={FindPointScreenStyles.deviceStatusText}>{deviceStore.status === "1" ? "已连接设备" : "未连接设备"}</Text>
          </View>
        </View>
        <View style={FindPointScreenStyles.deviceCoordinates}>
          <View style={FindPointScreenStyles.deviceCoordinatesContainer}>
            <Text style={FindPointScreenStyles.deviceCoordinatesText}>当前坐标位置:</Text>
            <Text style={FindPointScreenStyles.deviceCoordinatesText}>{`${currentLocation?.lon || "未知"}, ${
              currentLocation?.lat || "未知"
            }`}</Text>
          </View>
          <View style={FindPointScreenStyles.deviceCoordinatesContainer}>
            <Text style={FindPointScreenStyles.deviceCoordinatesText}>目标坐标位置:</Text>
            <Text style={FindPointScreenStyles.deviceCoordinatesText}>{`${route.params.point?.lon || "未知"}, ${
              route.params.point?.lat || "未知"
            }`}</Text>
          </View>
        </View>
      </View>
      {/* 权限弹窗 */}
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启位置权限"}
        message={"获取位置权限将用于获取当前定位与记录轨迹"}
      />
      {/* 设备连接弹窗 */}
      <DeviceConnectionPopup
        visible={showDeviceConnectionPopup}
        onClose={() => setShowDeviceConnectionPopup(false)}
        onAbortRemind={handleAbortRemind}
        onConnectDevice={handleConnectDevice}
      />
    </View>
  );
});

export default FindPointScreen;
