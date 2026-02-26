// 作业数据
import {View, Text, TouchableOpacity, Image, StatusBar} from "react-native";
import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";
import MapSwitcher from "@/components/common/MapSwitcher";
import PermissionPopup from "@/components/common/PermissionPopup";
import WebView from "react-native-webview";
import Geolocation from "@react-native-community/geolocation";
import useOptimizedHeading from "@/hooks/useOptimizedHeading";
import KeepAwake from "react-native-keep-awake";
import {useNavigation, useFocusEffect, useRoute, RouteProp} from "@react-navigation/native";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {showCustomToast} from "@/components/common/CustomToast";
import {MapWebviewMessage} from "@/types/land";
import {getToken} from "@/utils/tokenUtils";
import {getLandListData} from "@/services/land";
import WebSocketClass from "@/utils/webSocketClass";
import {deviceStore} from "@/stores/deviceStore";
import React from "react";
import {FarmingWorkDataScreenStyles} from "./styles/FarmingWorkDataScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import {FarmStackParamList} from "@/types/navigation";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import SelectWorkerPopup from "./components/SelectWorkerPopup";
import WorkDataManagePopup from "./components/WorkDataManagePopup";
import {farmingScienceLandList} from "@/services/farming";

type FarmingWorkDataRouteProp = RouteProp<
  Record<string, {farmingJoinTypeId: string; workUsers: {userName: string; mobile: string}[]}>,
  string
>;

const FarmingWorkDataScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<FarmStackParamList>>();
  const route = useRoute<FarmingWorkDataRouteProp>();
  const {farmingJoinTypeId, workUsers} = route.params;
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const isFirstLocationRef = useRef(true);
  const webSocketRef = useRef<WebSocketClass | null>(null);
  const [useLocationFromSocket, setUseLocationFromSocket] = useState(false);
  const [rtkLocation, setRtkLocation] = useState<{lat: number; lon: number}>({lat: 0, lon: 0});
  const isFirstSocketLocationRef = useRef(true);
  const locationLngLatRef = useRef<{longitude: number; latitude: number} | null>(null);
  const [showSelectWorkerPopup, setSelectWorkerPopup] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<{userName: string; mobile: string}>(workUsers[0]);

  // 启用屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  // 初始化定位服务
  useEffect(() => {
    getLocationService();
  }, []);

  // 初始化定位权限
  useEffect(() => {
    initLocationPermission();
  }, []);

  useEffect(() => {
    getFarmingLandData();
  }, []);

  // 当WebView准备好时
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
      initLocationByDeviceStatus();
    }
  }, [isWebViewReady, mapStore.mapType, deviceStore.status]);

  // 页面聚焦时：启动WebSocket连接（无论设备状态）
  useFocusEffect(
    React.useCallback(() => {
      initWebSocket();
      initLocationByDeviceStatus();
      return () => {
        if (webSocketRef.current) {
          webSocketRef.current.close();
          webSocketRef.current = null;
        }
        stopPositionWatch();
      };
    }, [hasLocationPermission, isWebViewReady]),
  );

  // 监听设备状态变化，切换定位源
  useEffect(() => {
    initLocationByDeviceStatus();
  }, [deviceStore.status, hasLocationPermission, isWebViewReady]);

  // 初始化定位权限和地图图层
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

  // 监听朝向变化，发送给WebView
  useOptimizedHeading(heading => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "UPDATE_MARKER_ROTATION",
        rotation: heading,
      }),
    );
  });

  // 根据设备状态初始化定位源
  const initLocationByDeviceStatus = () => {
    if (!isWebViewReady) {
      return;
    }
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      setUseLocationFromSocket(true);
      stopPositionWatch();
      isFirstLocationRef.current = true;
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
  const onToggleMapLayer = () => {
    setShowMapSwitcher(true);
  };

  // 处理地图选择
  const handleSelectMap = ({type, layerUrl}: {type: string; layerUrl: string}) => {
    mapStore.setMapType(type);
    if (type === "自定义" && layerUrl) {
      mapStore.setCustomMapType(layerUrl);
    }
    handleSelectMapLayer(type, layerUrl);
    setShowMapSwitcher(false);
  };

  // 处理地图图层选择逻辑
  const handleSelectMapLayer = (type: string, layerUrl: string) => {
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
  };

  // 切换地图图层
  const switchMapLayer = (layerType: string, layerUrl?: string) => {
    if (!isWebViewReady) return;
    const message = {
      type: "SWITCH_LAYER",
      layerType,
    };
    if (layerType === "CUSTOM" && layerUrl) {
      (message as any).customUrl = layerUrl;
    }
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  // 获取定位服务
  const getLocationService = async () => {
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

  // 定位位置
  const onLocatePosition = async () => {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }
    if (useLocationFromSocket) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "SET_ICON_LOCATION",
          location: rtkLocation,
        }),
      );
      return;
    }
    locateDevicePosition(true);
  };

  // 同意定位权限
  const handleAcceptPermission = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      setShowPermissionPopup(false);
      initLocationByDeviceStatus();
    }
  };

  // 拒绝定位权限
  const handleRejectPermission = () => {
    getLocationByIP();
    setShowPermissionPopup(false);
  };

  // 定位设备位置
  const locateDevicePosition = async (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      return;
    }
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
  };

  // 开启定位
  const startPositionWatch = async () => {
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      return;
    }
    stopPositionWatch();
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

  // 打开作业人弹窗
  const openSelectWorkerPopup = () => {
    setSelectWorkerPopup(true);
  };

  // 选择作业人
  const handleSelectWorker = (item: {userName: string; mobile: string}) => {
    setSelectedWorker(item);
    setSelectWorkerPopup(false);
  };

  // 关闭作业人弹窗
  const onCloseSelectWorkerPopup = (action?: string) => {
    setSelectWorkerPopup(false);
    if (action === "completeFarming" && farmingJoinTypeId) {
      setSelectWorkerPopup(false);
      showCustomToast("success", "农事完成成功");
    }
  };

  // 获取农事地块数据
  const getFarmingLandData = async () => {
    const {data} = await farmingScienceLandList({id: farmingJoinTypeId});
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "DRAW_MARK_ENCLOSURE_LAND",
        data,
      }),
    );
  };

  // 初始化WebSocket
  const initWebSocket = async () => {
    console.log("初始化WebSocket（无论设备状态）");
    if (!deviceStore.deviceImei) {
      return;
    }
    const token = await getToken();
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    webSocketRef.current = new WebSocketClass({
      data: {token, imei: deviceStore.deviceImei},
      onConnected: () => {
        if (rtkLocation.lat !== 0 && rtkLocation.lon !== 0) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SET_ICON_LOCATION",
              location: {lon: rtkLocation.lon, lat: rtkLocation.lat},
            }),
          );
        }
        initLocationByDeviceStatus();
      },
      onMessage: (data: any) => {
        const socketData = JSON.parse(JSON.stringify(data));
        if (socketData.taskType === "1" && socketData.lng && socketData.lat && socketData.lng !== 0 && socketData.lat !== 0) {
          const newLocation = {lon: socketData.lng, lat: socketData.lat};
          setRtkLocation(newLocation);
          console.log("WebSocket 接收定位数据:", newLocation);
          const messageType = isFirstSocketLocationRef.current ? "SET_ICON_LOCATION" : "UPDATE_ICON_LOCATION";
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: messageType,
              location: newLocation,
            }),
          );

          if (isFirstSocketLocationRef.current) {
            isFirstSocketLocationRef.current = false;
          }
        }
        if (socketData.deviceStatus === "2") {
          deviceStore.listenDeviceStatus("2");
          setUseLocationFromSocket(false);
          startPositionWatch();
          return;
        } else if (socketData.deviceStatus === "1") {
          deviceStore.listenDeviceStatus("1");
          setUseLocationFromSocket(true);
          stopPositionWatch();
        }
      },
      onError: error => {
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
      case "WEBVIEW_READY":
        setIsWebViewReady(true);
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
  };

  return (
    <View style={FarmingWorkDataScreenStyles.container}>
      {/* 顶部导航 */}
      <LinearGradient
        style={[FarmingWorkDataScreenStyles.HeaderContainer, {paddingTop: insets.top}]}
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={FarmingWorkDataScreenStyles.header}>
          <TouchableOpacity style={FarmingWorkDataScreenStyles.iconWrapper} onPress={() => navigation.goBack()}>
            <Image
              source={require("@/assets/images/common/icon-back-radius.png")}
              style={FarmingWorkDataScreenStyles.iconWrapperImage}
            />
          </TouchableOpacity>

          <TouchableOpacity style={FarmingWorkDataScreenStyles.titleContainer} onPress={openSelectWorkerPopup}>
            <Text style={FarmingWorkDataScreenStyles.title}>
              {selectedWorker.userName ? selectedWorker.userName : "无作业人"}
            </Text>
            <Image
              source={require("@/assets/images/farming/icon-down-white.png")}
              style={FarmingWorkDataScreenStyles.iconImage}
            />
          </TouchableOpacity>

          <View style={FarmingWorkDataScreenStyles.iconWrapper} />
        </View>
      </LinearGradient>
      {/* 地图 */}
      <View style={FarmingWorkDataScreenStyles.mapBox}>
        <View style={FarmingWorkDataScreenStyles.map} collapsable={false}>
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
          <View style={FarmingWorkDataScreenStyles.mapCopyright}>
            <Image source={require("@/assets/images/home/icon-td.png")} style={FarmingWorkDataScreenStyles.iconImg} />
            <Text style={FarmingWorkDataScreenStyles.copyrightText}>
              ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
            </Text>
          </View>
        </View>
        {/* 右侧控制按钮 */}
        <View style={FarmingWorkDataScreenStyles.rightControl}>
          <MapControlButton iconUrl={require("@/assets/images/home/icon-layer.png")} iconName="图层" onPress={onToggleMapLayer} />
        </View>
        <View style={FarmingWorkDataScreenStyles.locationControl}>
          <MapControlButton
            iconUrl={require("@/assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={onLocatePosition}
            style={{marginTop: 16}}
          />
        </View>

        {/* 图层切换弹窗 */}
        {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}

        {/* 权限弹窗 */}
        <PermissionPopup
          visible={showPermissionPopup}
          onAccept={handleAcceptPermission}
          onReject={handleRejectPermission}
          title={"开启位置权限"}
          message={"获取位置权限将用于获取当前定位与记录轨迹"}
        />

        {/* 作业状态弹窗 */}
        <WorkDataManagePopup farmingId={farmingJoinTypeId} />

        {/* 作业人弹窗 */}
        {showSelectWorkerPopup && workUsers?.length > 0 && (
          <SelectWorkerPopup
            farmingInfo={{farmingJoinTypeId, workUsers}}
            currentWorker={selectedWorker}
            onSelectWorker={handleSelectWorker}
            onClosePopup={onCloseSelectWorkerPopup}
          />
        )}
      </View>
    </View>
  );
});

export default FarmingWorkDataScreen;
