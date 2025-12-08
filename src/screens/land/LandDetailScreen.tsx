// 地块详情
import PermissionPopup from "@/components/common/PermissionPopup";
import {mapStore} from "@/stores/mapStore";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {useFocusEffect, useIsFocused, useNavigation, useRoute} from "@react-navigation/native";
import {useEffect, useRef, useState} from "react";
import {View, Image, Text, StyleSheet, StatusBar, TouchableOpacity, Platform} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import {showCustomToast} from "@/components/common/CustomToast";
import WebView from "react-native-webview";
import {LandDetailInfo, LandOrderItem, MapWebviewMessage} from "@/types/land";
import MapSwitcher from "@/components/common/MapSwitcher";
import MapControlButton from "@/components/land/MapControlButton";
import {observer} from "mobx-react-lite";
import KeepAwake from "react-native-keep-awake";
import LandDetailsPopup from "./components/LandDetailsPopup";
import {ContractDetail} from "@/types/contract";
import LandManagePopup from "./components/LandManagePopup";
import {getLandDetailsInfo, getLandOrderList} from "@/services/land";
import {getContractMessageDetail} from "@/services/contract";
import LinearGradient from "react-native-linear-gradient";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import EditLandNamePopup from "@/components/land/EditLandNamePopup";
import {updateStore} from "@/stores/updateStore";
import {deviceStore} from "@/stores/deviceStore";
import {saveTargetRoute} from "@/utils/navigationUtils";
import React from "react";
import WebSocketClass from "@/utils/webSocketClass";
import {getToken} from "@/utils/tokenUtils";
import useOptimizedHeading from "@/hooks/useOptimizedHeading";

const LandDetailScreen = observer(({route}: {route: {params: {landId: string}}}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const watchIdRef = useRef<number | null>(null);
  const webViewRef = useRef<WebView>(null);
  const isFirstLocationRef = useRef(true);
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [showLandDetailsPopup, setShowLandDetailsPopup] = useState(false);
  const [isShowLandManagePopup, setIsShowLandManagePopup] = useState(false);
  const [landInfo, setLandInfo] = useState();
  const [contractDetail, setContractDetail] = useState();
  const [orderList, setOrderList] = useState();
  const isFocused = useIsFocused();
  const [isShowEditLandNamePopup, setIsShowEditLandNamePopup] = useState(false);
  const [landId, setLandId] = useState("");
  const [landName, setLandName] = useState("");
  const router = useRoute();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const webSocketRef = useRef<WebSocketClass | null>(null);
  const [useLocationFromSocket, setUseLocationFromSocket] = useState(false);
  const [rtkLocation, setRtkLocation] = useState<{lat: number; lon: number}>({lat: 0, lon: 0});
  const isFirstSocketLocationRef = useRef(true);

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

  // 当页面聚焦且弹窗显示时，重新请求接口
  useEffect(() => {
    if (isFocused) {
      getLandDetailInfoData(route.params.landId);
    }
  }, [isFocused, updateStore.isUpdateLandDetail, route.params.landId]);

  // 当WebView准备好时，应用保存的地图类型
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
      console.log("LandManagementScreen 页面聚焦，初始化WebSocket连接（无论设备状态）");

      // 初始化WebSocket（不管设备是否在线）
      initWebSocket();

      // 根据当前设备状态初始化定位源
      initLocationByDeviceStatus();

      // 页面失焦时：关闭WebSocket + 停止GPS
      return () => {
        console.log("LandManagementScreen 页面失焦，关闭所有定位相关");
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

  // 监听朝向变化，发送给WebView
  useOptimizedHeading(heading => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "UPDATE_MARKER_ROTATION",
        rotation: heading,
      }),
    );
  });

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

  // 显示地图切换器
  const onToggleMapLayer = () => {
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
    setIsShowLandManagePopup(false);
    closeLandDetailsPopup();
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "REMOVE_SPECIFY_LAND",
        data: landInfo,
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

  // 获取地块详情数据
  const getLandDetailInfoData = async (id: string): Promise<void> => {
    const {data} = await getLandDetailsInfo(id);
    console.log("获取地块详情数据", data);
    if (!data || !data[0]) {
      showCustomToast("error", "地块详情数据为空");
      return;
    }
    setLandInfo(data[0]);
    setLandId(data[0].id || "");
    setLandName(data[0].landName || "");
    if (data[0].landType === "2") {
      await getTrusteeshipLandOrderList(id);
    } else {
      await getContractDetail(id as string);
    }
    setShowLandDetailsPopup(true);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "DRAW_LAND_DETAIL",
        data: data[0],
      }),
    );
  };

  // 连接设备
  const handleConnectDevice = () => {
    saveTargetRoute(router.name);
    navigation.navigate("AddDevice" as never);
  };

  // 获取合同详细信息
  const getContractDetail = async (id: string) => {
    const {data} = await getContractMessageDetail({landId: id});
    setContractDetail(data);
  };

  // 获取托管地块订单列表
  const getTrusteeshipLandOrderList = async (id: string) => {
    const {data} = await getLandOrderList(id);
    setOrderList(data.list);
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
        // 连接成功后，立即检查是否已有缓存的RTK坐标，有则更新地图
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

          // 关键修改：首次定位用 SET_ICON_LOCATION（带居中），后续用 UPDATE_ICON_LOCATION（不带居中）
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
        console.error("WebSocket 错误:", error);
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
        if (hasLocationPermission && !(deviceStore.deviceImei && deviceStore.status === "1")) {
          startPositionWatch();
        }
        break;
      // 点击地块
      case "POLYGON_CLICK":
        setShowLandDetailsPopup(true);
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
    <View style={styles.container}>
      {/* 权限弹窗 */}
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启位置权限"}
        message={"获取位置权限将用于获取当前定位与记录轨迹"}
      />
      {/* 顶部导航 */}
      <LinearGradient style={[styles.headerContainer, {paddingTop: insets.top}]} colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.goBack()}>
            <Image source={require("@/assets/images/common/icon-back-radius.png")} style={styles.iconImage} />
          </TouchableOpacity>

          <Text style={styles.title}>地块详情</Text>

          <TouchableOpacity style={styles.iconWrapper} onPress={handleConnectDevice}>
            <Image
              source={
                deviceStore.status === "1"
                  ? require("@/assets/images/common/icon-device-connect.png")
                  : require("@/assets/images/common/icon-device-disconnect.png")
              }
              style={styles.iconImage}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {/* 地图 */}
      <View style={styles.mapBox}>
        <View style={styles.map} collapsable={false}>
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
          <View style={styles.mapCopyright}>
            <Image source={require("../../assets/images/home/icon-td.png")} style={styles.iconImg} />
            <Text style={styles.copyrightText}>©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471</Text>
          </View>
        </View>
        {/* 右侧控制按钮 */}
        <View style={styles.rightControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-layer.png")}
            iconName="图层"
            onPress={onToggleMapLayer}
          />
        </View>
        <View style={[styles.locationControl, {bottom: showLandDetailsPopup ? 450 : 60}]}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={onLocatePosition}
            style={{marginTop: 16}}
          />
        </View>
        {/* 图层切换弹窗 */}
        {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}
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
        {/* 地块名称编辑弹窗 */}
        {isShowEditLandNamePopup && <EditLandNamePopup onClose={closeEditLandNamePopup} id={landId} initialName={landName} />}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapBox: {flex: 1},
  rightControl: {
    position: "absolute",
    top: 100,
    right: 16,
  },
  locationControl: {
    position: "absolute",
    right: 16,
  },
  map: {flex: 1},
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
  headerContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 999,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: Platform.OS === "ios" ? 44 : 56,
  },
  title: {
    fontSize: 20,
    color: "#fff",
  },
  iconWrapper: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
});

export default LandDetailScreen;
