// 土地管理
import LandHomeCustomNavbar from "@/components/land/LandHomeCustomNavbar";
import {View, Image, Text} from "react-native";
import {LandManagementScreenStyles} from "./styles/LandManagementScreen";
import MapControlButton from "@/components/land/MapControlButton";
import {useFocusEffect, useIsFocused, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import MapSwitcher from "@/components/common/MapSwitcher";
import {useEffect, useRef, useState} from "react";
import WebView from "react-native-webview";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import Geolocation from "@react-native-community/geolocation";
import PermissionPopup from "@/components/common/PermissionPopup";
import {mapStore} from "@/stores/mapStore";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandDetailInfo, LandOrderItem, MapWebviewMessage} from "@/types/land";
import KeepAwake from "react-native-keep-awake";
import {StatusBar} from "react-native";
import {useTabBar} from "@/navigation/TabBarContext";
import {getLandDetailsInfo, getLandListData, getLandOrderList} from "@/services/land";
import LandListModel from "@/components/land/LandListModel";
import DeviceConnectionPopup from "@/components/device/DeviceConnectionPopup";
import {saveTargetRoute} from "@/utils/navigationUtils";
import {getRtkPopupStatus, setRtkPopupTips} from "@/services/device";
import {deviceStore} from "@/stores/deviceStore";
import {updateStore} from "@/stores/updateStore";
import useOptimizedHeading from "@/hooks/useOptimizedHeading";
import LandDetailsPopup from "@/screens/land/components/LandDetailsPopup";
import {getContractInfoDetail} from "@/services/contract";
import {ContractDetail} from "@/types/contract";
import CustomLoading from "@/components/common/CustomLoading";
import LandManagePopup from "@/screens/land/components/LandManagePopup";
import {observer} from "mobx-react-lite";
import {getToken} from "@/utils/tokenUtils";
import WebSocketClass from "@/utils/webSocketClass";
import React from "react";
import EditLandNamePopup from "@/components/land/EditLandNamePopup";

type LandStackParamList = {
  Enclosure: undefined;
  AddDevice: undefined;
};

const LandManagementScreen = observer(() => {
  const navigation = useNavigation<StackNavigationProp<LandStackParamList>>();
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const isFirstLocationRef = useRef(true);
  const watchIdRef = useRef<number | null>(null);
  const [isShowMapFullScreen, setIsShowMapFullScreen] = useState(false);
  const {hideTabBar, showTabBar} = useTabBar();
  const [isMapType, setIsMapType] = useState(true);
  const [showDeviceConnectionPopup, setShowDeviceConnectionPopup] = useState(false);
  const route = useRoute();
  const [showLandDetailsPopup, setShowLandDetailsPopup] = useState(false);
  const [landInfoList, setLandInfoList] = useState<LandDetailInfo[]>([]);
  const [landInfo, setLandInfo] = useState();
  const [contractDetail, setContractDetail] = useState();
  const [orderList, setOrderList] = useState();
  const [loading, setLoading] = useState(false);
  const [isShowLandManagePopup, setIsShowLandManagePopup] = useState(false);
  const [landId, setLandId] = useState("");
  const [landName, setLandName] = useState("");
  const isFocused = useIsFocused();
  const webSocketRef = useRef<WebSocketClass | null>(null);
  const [useLocationFromSocket, setUseLocationFromSocket] = useState(false);
  const [rtkLocation, setRtkLocation] = useState<{lat: number; lon: number}>({lat: 0, lon: 0});
  const isFirstSocketLocationRef = useRef(true);
  const [isShowEditLandNamePopup, setIsShowEditLandNamePopup] = useState(false);

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

  // 获取地块数据
  useEffect(() => {
    getLandInfoList();
  }, [updateStore.isUpdateLand, updateStore.isUpdateLandDetail]);

  // 当页面聚焦且弹窗显示时，重新请求接口
  useEffect(() => {
    if (isFocused && showLandDetailsPopup) {
      getLandDetailInfoData(landId);
    }
  }, [isFocused, updateStore.isUpdateLand, updateStore.isUpdateLandDetail]);

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

    // 如果有绑定设备但设备离线：使用 GPS（仍需手机定位权限）
    if (deviceStore.deviceImei && deviceStore.status === "2") {
      setUseLocationFromSocket(false);
      if (hasLocationPermission) {
        startPositionWatch();
      }
      return;
    }

    // 走手机GPS逻辑（需要定位权限）
    setUseLocationFromSocket(false);
    if (hasLocationPermission) {
      startPositionWatch();
    }
  };

  // 切换tab
  const changeTab = (title: string, type: string) => {
    if (type === "map") {
      setIsMapType(true);
    } else {
      setIsMapType(false);
    }
    if (showLandDetailsPopup) {
      closeLandDetailsPopup();
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

  // 切换图层
  const expandMapLayer = () => {
    setShowMapSwitcher(true);
  };

  // 处理地图选择
  const handleSelectMap = ({type, layerUrl}: {type: string; layerUrl: string}) => {
    // 保存选择的地图类型到mapStore
    mapStore.setMapType(type);
    if (type === "自定义" && layerUrl) {
      mapStore.setCustomMapType(layerUrl);
    }

    // 应用选择的地图
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
    // 只有自定义图层才添加layerUrl属性
    if (layerType === "CUSTOM" && layerUrl) {
      (message as any).customUrl = layerUrl;
    }
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  // 处理取消提醒
  const handleAbortRemind = async () => {
    await setRtkPopupTips({});
    setShowDeviceConnectionPopup(false);
    navigation.navigate("Enclosure");
  };

  // 处理连接设备
  const handleConnectDevice = () => {
    saveTargetRoute(route.name);
    navigation.navigate("AddDevice");
    setShowDeviceConnectionPopup(false);
  };

  // 圈地
  const startEnclosure = async () => {
    const {data} = await getRtkPopupStatus({});
    if (data.status) {
      navigation.navigate("Enclosure");
    } else if (deviceStore.status === "1") {
      navigation.navigate("Enclosure");
    } else {
      setShowDeviceConnectionPopup(true);
    }
  };

  // 隐藏地图按钮
  const hideMapControl = () => {
    setIsShowMapFullScreen(true);
    // 隐藏状态栏
    StatusBar.setHidden(true);
    // 隐藏底部 TabBar
    hideTabBar();
  };

  // 显示地图按钮
  const showMapControl = () => {
    setIsShowMapFullScreen(false);

    // 显示状态栏
    StatusBar.setHidden(false);
    // 恢复底部 TabBar
    showTabBar();
  };

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

  // 定位位置
  const onLocatePosition = async () => {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }

    // 设备在线时，强制使用WebSocket定位，禁止GPS
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "SET_ICON_LOCATION",
          location: rtkLocation.lon !== 0 && rtkLocation.lat !== 0 ? rtkLocation : {lon: 0, lat: 0}, // 无RTK数据时不绘制
        }),
      );
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
      // 权限获取后，根据设备状态初始化定位
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
    // 设备在线时，直接返回，不执行任何GPS定位绘制
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

  // 开启定位
  const startPositionWatch = async () => {
    if (deviceStore.deviceImei && deviceStore.status === "1") {
      return;
    }
    stopPositionWatch();

    // 初始定位（无论定位源，先获取一次位置）
    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
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
        // 关键：仅当定位源为GPS（useLocationFromSocket=false）时，才更新定位图标
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

  // 关闭地块详情弹窗
  const closeLandDetailsPopup = () => {
    setShowLandDetailsPopup(false);
    setOrderList(undefined);
    setContractDetail(undefined);
    setContractDetail(undefined);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "RESET_LAND_ACTIVE_STYLE",
      }),
    );
  };

  // 停止定位
  const stopPositionWatch = () => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current as any);
      watchIdRef.current = null;
    }
  };

  // 地块管理
  const onLandManage = (landInfo: any) => {
    setLandInfo(landInfo);
    setIsShowLandManagePopup(true);
  };

  // 关闭地块管理弹窗
  const closeLandManagePopup = (action?: string, id?: string) => {
    switch (action) {
      case "remove":
        showCustomToast("success", "移出地块成功");
        break;
      case "delete":
        showCustomToast("success", "删除地块成功");
        break;
      case "quit":
        showCustomToast("success", "退地块成功");
        break;
      default:
        break;
    }
    const landManageInfo = landInfoList.find(item => item.id === id);
    setIsShowLandManagePopup(false);
    closeLandDetailsPopup();
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "REMOVE_SPECIFY_LAND",
        data: landManageInfo,
      }),
    );
  };

  // 编辑地块名称(合并地块)
  const onEditLandName = () => {
    setIsShowEditLandNamePopup(true);
  };

  // 关闭地块名称编辑弹窗
  const closeEditLandNamePopup = (status?: string) => {
    if (status === "success") {
      showCustomToast("success", "保存地块名称成功");
    }
    if (status === "error") {
      showCustomToast("error", "保存地块名称失败");
    }
    setIsShowEditLandNamePopup(false);
    setIsShowLandManagePopup(false);
  };

  // 获取地块信息列表
  const getLandInfoList = async () => {
    const {data} = await getLandListData({quitStatus: "0"});
    setLandInfoList(data as unknown as LandDetailInfo[]);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "DRAW_ENCLOSURE_LAND",
        data,
      }),
    );
  };

  // 获取地块详情数据
  const getLandDetailInfoData = async (id: string): Promise<void> => {
    const {data} = await getLandDetailsInfo(id);
    if (!data || !data[0]) {
      showCustomToast("error", "地块详情数据为空");
      return;
    }
    setLandInfo(data[0]);
    setLandName(data[0].landName || "");
    if (data[0].landType === "2") {
      await getTrusteeshipLandOrderList(id);
    } else {
      await getContractDetail(id as string);
    }
    // 隐藏加载弹窗
    setLoading(false);
    setShowLandDetailsPopup(true);
  };

  // 获取合同详细信息
  const getContractDetail = async (id: string) => {
    const {data} = await getContractInfoDetail({landId: id});
    setContractDetail(data);
  };

  // 获取托管地块订单列表
  const getTrusteeshipLandOrderList = async (id: string) => {
    const {data} = await getLandOrderList(id);
    setOrderList(data.list);
  };

  // 初始化WebSocket（无论设备状态，都建立连接）
  const initWebSocket = async () => {
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
        // 过滤无效坐标（避免0,0坐标）
        if (socketData.taskType === "1" && socketData.lng && socketData.lat && socketData.lng !== 0 && socketData.lat !== 0) {
          const newLocation = {lon: socketData.lng, lat: socketData.lat};
          setRtkLocation(newLocation); // 更新状态
          console.log("WebSocket 接收定位数据:", newLocation);
          // 首次定位用 SET_ICON_LOCATION（带居中），后续用 UPDATE_ICON_LOCATION（不带居中）
          const messageType = isFirstSocketLocationRef.current ? "SET_ICON_LOCATION" : "UPDATE_ICON_LOCATION";

          webViewRef.current?.postMessage(
            JSON.stringify({
              type: messageType,
              location: newLocation,
            }),
          );

          // 首次定位后重置标记
          if (isFirstSocketLocationRef.current) {
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
        if (hasLocationPermission && !(deviceStore.deviceImei && deviceStore.status === "1")) {
          locateDevicePosition(true);
        }
        break;
      // 点击多边形
      case "POLYGON_CLICK":
        // 显示加载弹窗
        setLoading(true);
        setLandId(data.id as string);
        await getLandDetailInfoData(data.id as string);
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
    <View style={LandManagementScreenStyles.container}>
      {/* 顶部导航 */}
      {!isShowMapFullScreen && <LandHomeCustomNavbar onChangeTab={changeTab} />}
      <View
        style={[
          LandManagementScreenStyles.mapContainer,
          !isMapType && {zIndex: -1}, // 列表模式时将地图置于底层
        ]}>
        <View style={LandManagementScreenStyles.map}>
          {/* 地图 */}
          <View style={[LandManagementScreenStyles.map, isShowMapFullScreen && {marginTop: 0, flex: 1}]}>
            <WebView
              source={{uri: "file:///android_asset/web/map.html"}}
              ref={webViewRef}
              originWhitelist={["*"]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              onMessage={receiveWebviewMessage}
              style={{flex: 1}}
            />
            <View style={LandManagementScreenStyles.mapCopyright}>
              <Image source={require("@/assets/images/home/icon-td.png")} style={LandManagementScreenStyles.iconImg} />
              <Text style={LandManagementScreenStyles.copyrightText}>
                ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
              </Text>
            </View>
          </View>
          {/* 右侧按钮 */}
          <View style={LandManagementScreenStyles.rightControl}>
            {!isShowMapFullScreen && (
              <MapControlButton
                iconUrl={require("@/assets/images/home/icon-layer.png")}
                iconName="图层"
                onPress={expandMapLayer}
              />
            )}
            {!isShowMapFullScreen && (
              <MapControlButton
                iconUrl={require("@/assets/images/home/icon-enclosure.png")}
                iconName="圈地"
                onPress={startEnclosure}
                style={{marginTop: 16}}
              />
            )}
            {!isShowMapFullScreen && (
              <MapControlButton
                iconUrl={require("@/assets/images/home/icon-hide.png")}
                iconName="隐藏"
                onPress={hideMapControl}
                style={{marginTop: 16}}
              />
            )}
          </View>
          {/* 地块类型图标 */}
          <View style={LandManagementScreenStyles.landType}>
            <View style={LandManagementScreenStyles.landTypeItem}>
              <Image source={require("@/assets/images/home/icon-green.png")} style={LandManagementScreenStyles.icon} />
              <Text style={LandManagementScreenStyles.text}>流转</Text>
            </View>

            <View style={LandManagementScreenStyles.landTypeItem}>
              <Image source={require("@/assets/images/home/icon-blue.png")} style={LandManagementScreenStyles.icon} />
              <Text style={LandManagementScreenStyles.text}>托管</Text>
            </View>
          </View>
          {/* 定位按钮 */}
          <View style={LandManagementScreenStyles.locationControl}>
            {isShowMapFullScreen && (
              <MapControlButton
                iconUrl={require("@/assets/images/home/icon-show.png")}
                iconName="显示"
                onPress={showMapControl}
                style={{marginTop: 16}}
              />
            )}
            <MapControlButton
              iconUrl={require("@/assets/images/home/icon-location.png")}
              iconName="定位"
              onPress={onLocatePosition}
              style={{marginTop: 16}}
            />
          </View>
          {/* 地图切换弹窗组件 */}
          {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}
          {/* 权限弹窗 */}
          <PermissionPopup
            visible={showPermissionPopup}
            onAccept={handleAcceptPermission}
            onReject={handleRejectPermission}
            title={"开启位置权限"}
            message={"获取位置权限将用于获取当前定位与记录轨迹"}
          />
        </View>
      </View>

      {/* 列表模式 */}
      <View
        style={[
          LandManagementScreenStyles.listContainer,
          !isMapType ? {zIndex: 1} : {zIndex: -1}, // 列表模式时置于顶层
        ]}>
        <LandListModel />
      </View>
      {/* 设备连接弹窗 */}
      <DeviceConnectionPopup
        visible={showDeviceConnectionPopup}
        onClose={() => setShowDeviceConnectionPopup(false)}
        onAbortRemind={handleAbortRemind}
        onConnectDevice={handleConnectDevice}
      />
      {/* 地块详情弹窗 */}
      {showLandDetailsPopup && (
        <LandDetailsPopup
          onClose={() => closeLandDetailsPopup()}
          onBack={() => closeLandDetailsPopup()}
          onLandManage={onLandManage}
          landInfo={landInfo as unknown as LandDetailInfo}
          contractDetail={contractDetail as unknown as ContractDetail}
          landOrderList={orderList as unknown as LandOrderItem[]}
        />
      )}
      {/* 地块管理弹窗 */}
      {isShowLandManagePopup && (
        <LandManagePopup
          onClosePopup={closeLandManagePopup}
          onEditLandName={onEditLandName}
          landInfo={landInfo as unknown as LandDetailInfo}
        />
      )}
      {/* 自定义加载弹窗 */}
      <CustomLoading visible={loading} text="地块详情加载中..." />
      {/* 地块名称编辑弹窗 */}
      {isShowEditLandNamePopup && <EditLandNamePopup onClose={closeEditLandNamePopup} id={landId} initialName={landName} />}
    </View>
  );
});

export default LandManagementScreen;
