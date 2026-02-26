// 农事任务详情
import React from "react";
import {View, Text, TouchableOpacity, Image, StatusBar, BackHandler} from "react-native";
import {useEffect, useRef, useState, useCallback} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";
import MapSwitcher from "@/components/common/MapSwitcher";
import PermissionPopup from "@/components/common/PermissionPopup";
import WebView from "react-native-webview";
import KeepAwake from "react-native-keep-awake";
import {useNavigation, useFocusEffect, useRoute, RouteProp} from "@react-navigation/native";
import {showCustomToast} from "@/components/common/CustomToast";
import {getToken} from "@/utils/tokenUtils";
import WebSocketClass from "@/utils/webSocketClass";
import {deviceStore} from "@/stores/deviceStore";
import Geolocation from "@react-native-community/geolocation";
import {MechanicalTaskDetailScreenStyles} from "./styles/MechanicalTaskDetailScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import {RootStackParamList} from "@/types/navigation";
import CustomFarmingHeader from "@/components/common/CustomFarmingHeader";
import MechanicalTaskBottomPopup from "./components/MechanicalTaskBottomPopup";
import {
  farmingDetailInfo,
  farmingScienceLandList,
  farmingTaskLocusStatus,
  mechanicalParentFarmingLocusList,
  mechanicalTaskDetailLocusList,
} from "@/services/farming";
import {updateStore} from "@/stores/updateStore";
import MechanicalDeviceStatusPopup from "./components/MechanicalDeviceStatusPopup";
import Popup from "@/components/common/Popup";
import {saveTargetRoute} from "@/utils/navigationUtils";
import {getDeviceConnectStatus} from "@/services/device";
import {MapWebviewMessage} from "@/types/land";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import useOptimizedHeading from "@/hooks/useOptimizedHeading";
import {userStore} from "@/stores/userStore";

type FarmingDetailParams = {
  farmingId?: string;
  farmingJoinTypeId: string;
  navTitle: string;
};

type FarmingDetailRouteProp = RouteProp<Record<string, FarmingDetailParams>, string>;

const MechanicalTaskDetailScreen = observer(() => {
  // 导航与路由
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<FarmingDetailRouteProp>();
  const webViewRef = useRef<WebView>(null);
  // WebSocket相关Ref
  const webSocketRef = useRef<WebSocketClass | null>(null);
  const isFirstSocketLocationRef = useRef(true);
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const isFirstLocationRef = useRef(true);
  const [useLocationFromSocket, setUseLocationFromSocket] = useState(false);
  const [rtkLocation, setRtkLocation] = useState<{lat: number; lon: number}>({lat: 0, lon: 0});
  const locationLngLatRef = useRef<{longitude: number; latitude: number} | null>(null);
  // 业务相关状态
  const [showPopupTips, setShowPopupTips] = useState(true);
  const beforeRemoveRef = useRef<any>(null);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const [popupTips, setPopupTips] = useState("暂无设备，已启用GPS记录轨迹");
  const [popupTipsStyle, setPopupTipsStyle] = useState({backgroundColor: "#FFECE9", color: "#FF563A"});
  const [loading, setLoading] = useState<boolean>(false);
  const [farmingDetailData, setFarmingDetailData] = useState<any>(null);
  const [showMechanicalDeviceStatusPopup, setShowMechanicalDeviceStatusPopup] = useState(false);
  const [devicePopupMessage, setDevicePopupMessage] = useState(
    "检测到未绑定设备，为您推荐GPS记录轨迹方式；如需提高轨迹精度，请绑定设备",
  );
  const [devicePopupAcceptButtonText, setDevicePopupAcceptButtonText] = useState("有设备，绑定设备");
  const [devicePopupRejectButtonText, setDevicePopupRejectButtonText] = useState("无设备，GPS记录");
  const [deviceStatus, setDeviceStatus] = useState<string>("");
  const [farmingLocusStatus, setFarmingLocusStatus] = useState<{locusLogType: string; manageLocusLogType: string}>();

  // 屏幕常亮
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

  // 获取农事数据
  useEffect(() => {
    getFarmingDetailData();
    getFarmingLandData();
  }, []);

  // 当WebView准备好时
  useEffect(() => {
    if (isWebViewReady && hasLocationPermission) {
      applySavedMapType();
      initLocationByDeviceStatus();
    }
  }, [isWebViewReady, mapStore.mapType, deviceStatus, hasLocationPermission]);

  useEffect(() => {
    if (!!deviceStatus) return;
    switch (deviceStatus) {
      case "0":
        setPopupTips("暂无设备，已启用GPS记录轨迹");
        setPopupTipsStyle({backgroundColor: "#EBFFE4", color: "#08AE3C"});
        break;
      case "1":
        setPopupTips("设备已连接，请正常作业");
        setPopupTipsStyle({color: "#08AE3C", backgroundColor: "#EBFFE4"});
        break;
      case "2":
        setPopupTips("设备离线，已启用GPS记录轨迹");
        setPopupTipsStyle({color: "#F58700", backgroundColor: "#FFF7E8"});
        setDevicePopupMessage("设备离线，已启用GPS记录轨迹");
        setDevicePopupAcceptButtonText("换绑设备");
        setDevicePopupRejectButtonText("GPS记录");
        break;
    }
  }, [deviceStatus]);

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
  }, [deviceStatus, hasLocationPermission, isWebViewReady]);

  // 初始化定位权限和地图图层
  const initLocationPermission = async () => {
    const granted = await checkLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      if (!(deviceStore.farmingDeviceImei && deviceStatus === "1")) {
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

    if (deviceStore.farmingDeviceImei && deviceStatus === "1") {
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

    // 设备离线时：获取历史轨迹并传递给GPS定位
    if (deviceStore.farmingDeviceImei && deviceStatus === "2") {
      console.log("设备离线，切换到GPS定位，保留历史轨迹");
      setUseLocationFromSocket(false);

      // 通知WebView保留历史轨迹数据
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "SAVE_FARMING_LOCUS_HISTORY",
        }),
      );

      if (hasLocationPermission && locationLngLatRef.current) {
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "UPDATE_FARMING_LOCUS",
            location: {lng: locationLngLatRef.current.longitude, lat: locationLngLatRef.current.latitude},
            userName: userStore.userInfo?.nickName || "未知用户",
          }),
        );
      }

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
    if (deviceStore.farmingDeviceImei && deviceStatus === "1") {
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
    if (deviceStore.farmingDeviceImei && deviceStatus === "1") {
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
    if (deviceStore.farmingDeviceImei && deviceStatus === "1") {
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

        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "UPDATE_ICON_LOCATION",
            location: {lng: longitude, lat: latitude},
          }),
        );

        const isTaskNotFinished = farmingDetailData?.status !== "1";
        if (isTaskNotFinished || farmingDetailData === null) {
          // GPS轨迹更新（无设备/设备离线必执行）
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "UPDATE_FARMING_LOCUS",
              location: {lng: longitude, lat: latitude},
              userName: userStore.userInfo?.nickName || "未知用户",
            }),
          );
        }

        // WebSocket上报逻辑单独处理（仅设备在线时执行）
        if (isTaskNotFinished && webSocketRef.current && locationLngLatRef.current) {
          webSocketRef.current.socketTask?.send({
            data: JSON.stringify([
              {
                deviceType: "autoDriving",
                farmingJoinTypeId: route.params?.farmingJoinTypeId,
                lng: longitude,
                lat: latitude,
              },
            ]),
          });
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

  // 绑定&换绑设备
  const handleConnectDevice = () => {
    saveTargetRoute(route.name, ["Main", "MechanicalTask"], {...route.params});
    navigation.navigate("AddDevice", {farmingJoinTypeId: route.params?.farmingJoinTypeId, taskType: "2"});
  };

  // 农事设备弹窗-确认
  const handleAcceptMechanicalDeviceStatus = () => {
    saveTargetRoute(route.name, ["Main", "MechanicalTask"], {...route.params});
    navigation.navigate("AddDevice", {farmingJoinTypeId: route.params?.farmingJoinTypeId, taskType: "2"});
    setShowMechanicalDeviceStatusPopup(false);
  };

  // 农事设备弹窗-拒绝
  const handleRejectMechanicalDeviceStatus = () => {
    setShowMechanicalDeviceStatusPopup(false);
  };

  // 关闭提示框
  const closePopupTips = () => {
    setShowPopupTips(false);
  };

  // 查询设备在线状态
  const checkDeviceOnlineStatus = async (imei: string) => {
    if (!deviceStore.farmingDeviceImei) {
      return;
    }
    const {data} = await getDeviceConnectStatus({imei, farmingJoinTypeId: route.params?.farmingJoinTypeId, taskType: "2"});
    setDeviceStatus(data.deviceStatus);
    switch (data.deviceStatus) {
      case "0":
        setPopupTips("暂无设备，已启用GPS记录轨迹");
        setPopupTipsStyle({backgroundColor: "#EBFFE4", color: "#08AE3C"});
        break;
      case "1":
        setPopupTips("设备已连接，请正常作业");
        setPopupTipsStyle({color: "#08AE3C", backgroundColor: "#EBFFE4"});
        break;
      case "2":
        setPopupTips("设备离线，已启用GPS记录轨迹");
        setPopupTipsStyle({color: "#F58700", backgroundColor: "#FFF7E8"});
        setDevicePopupMessage("设备离线，已启用GPS记录轨迹");
        setDevicePopupAcceptButtonText("换绑设备");
        setDevicePopupRejectButtonText("GPS记录");
        break;
    }
  };

  // 获取农事详情数据
  const getFarmingDetailData = async () => {
    try {
      const {data} = await farmingDetailInfo({farmingJoinTypeId: route.params?.farmingJoinTypeId, type: "2"});
      console.log("农事详情数据：", data);
      if (!data) return;
      setLoading(false);
      setFarmingDetailData(data);
      await getFarmingLocusStatus();
      await getFarmingLocusData(data.status);
      await getParentFarmingLocusList();
      if (data.status === "1") return;
      setDeviceStatus(data.deviceStatus);
      if (data.deviceStatus === "0") {
        setPopupTips("暂无设备，已启用GPS记录轨迹");
        setPopupTipsStyle({color: "#FF563A", backgroundColor: "#FFECE9"});
        setDevicePopupMessage("检测到未绑定设备，为您推荐GPS记录轨迹方式，如需提高轨迹精度，请绑定设备");
        setDevicePopupAcceptButtonText("有设备，绑定设备");
        setDevicePopupRejectButtonText("无设备，GPS记录");
        setShowMechanicalDeviceStatusPopup(true);
      } else {
        deviceStore.setFarmingDeviceImei(data.dyDevice.imei);
        checkDeviceOnlineStatus(data.dyDevice.imei);
      }
      updateStore.setIsUpdateFarming(false);
    } catch (error) {
      showCustomToast("error", "获取农事详情失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取农事轨迹状态
  const getFarmingLocusStatus = async () => {
    try {
      const {data} = await farmingTaskLocusStatus({farmingJoinTypeId: route.params?.farmingJoinTypeId});
      console.log("农事轨迹状态：", data);
      setFarmingLocusStatus(data);
      if (!data) return;
    } catch (error) {
      showCustomToast("error", "获取农事轨迹状态失败，请稍后重试");
    }
  };

  // 获取农事轨迹数据
  const getFarmingLocusData = async (status: string) => {
    try {
      const {data} = await mechanicalTaskDetailLocusList({
        imei: deviceStore.farmingDeviceImei,
        status,
        farmingJoinTypeId: route.params?.farmingJoinTypeId,
      });
      console.log("农事轨迹数据：", data);
      if (!data?.length) return;
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "DRAW_FARMING_LOCUS_List",
          data,
        }),
      );
      if (!data) return;
    } catch (error) {
      showCustomToast("error", "获取农事轨迹失败，请稍后重试");
    }
  };

  // 获取上级农事轨迹列表
  const getParentFarmingLocusList = async () => {
    try {
      const {data} = await mechanicalParentFarmingLocusList({
        farmingJoinTypeId: route.params?.farmingJoinTypeId,
      });
      console.log("上级农事轨迹列表：", data);
      if (!data?.length) return;
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "DRAW_FARMING_LOCUS_List",
          data,
        }),
      );
      if (!data) return;
    } catch (error) {
      showCustomToast("error", "获取上级农事轨迹列表失败，请稍后重试");
    }
  };

  // 获取农事地块数据
  const getFarmingLandData = async () => {
    const {data} = await farmingScienceLandList({id: route.params?.farmingJoinTypeId});
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "DRAW_MARK_ENCLOSURE_LAND",
        data,
      }),
    );
  };

  // 初始化WebSocket
  const initWebSocket = async () => {
    console.log("deviceStore.farmingDeviceImei:", deviceStore.farmingDeviceImei);
    if (!deviceStore.farmingDeviceImei) {
      return;
    }
    const token = await getToken();
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    webSocketRef.current = new WebSocketClass({
      data: {token, imei: deviceStore.farmingDeviceImei},
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
        console.log("WebSocket 接收定位数据:", socketData);
        if (socketData.taskType === "2" && socketData.lng && socketData.lat && socketData.lng !== 0 && socketData.lat !== 0) {
          const newLocation = {lon: socketData.lng, lat: socketData.lat};
          setRtkLocation(newLocation);
          const messageType = isFirstSocketLocationRef.current ? "SET_ICON_LOCATION" : "UPDATE_ICON_LOCATION";
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: messageType,
              location: newLocation,
            }),
          );

          if (farmingDetailData?.status !== "1") {
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: "UPDATE_FARMING_LOCUS",
                location: {lng: newLocation.lon, lat: newLocation.lat},
                userName: userStore.userInfo?.nickName,
              }),
            );
          }

          if (farmingDetailData?.status !== "1" && webSocketRef.current && newLocation) {
            webSocketRef.current.socketTask?.send({
              data: JSON.stringify([
                {
                  deviceType: "autoDriving",
                  farmingJoinTypeId: route.params?.farmingJoinTypeId,
                  lng: newLocation.lon,
                  lat: newLocation.lat,
                },
              ]),
            });
          }

          if (isFirstSocketLocationRef.current) {
            isFirstSocketLocationRef.current = false;
          }
        }
        if (socketData.deviceStatus === "2" && farmingDetailData?.dyDevice?.imei) {
          setDeviceStatus("2");
          deviceStore.listenDeviceStatus("2");
          setUseLocationFromSocket(false);

          // WebSocket收到离线状态时，通知WebView保留轨迹
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SAVE_FARMING_LOCUS_HISTORY",
            }),
          );

          startPositionWatch();
          return;
        } else if (socketData.deviceStatus === "1") {
          setDeviceStatus("1");
          deviceStore.listenDeviceStatus("1");
          setUseLocationFromSocket(true);
          stopPositionWatch();
        }
      },
      onError: error => {
        console.error("WebSocket错误:", error);
        setUseLocationFromSocket(false);

        // 错误时保留轨迹
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SAVE_FARMING_LOCUS_HISTORY",
          }),
        );

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
        if (hasLocationPermission && !(deviceStore.farmingDeviceImei && deviceStatus === "1")) {
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

  // 页面返回监听
  useFocusEffect(() => {
    if (farmingDetailData?.status === "1") return;
    beforeRemoveRef.current = navigation.addListener("beforeRemove", e => {
      e.preventDefault();
      if (!showBackPopup) {
        setShowBackPopup(true);
      }
    });

    // Android 实体返回键监听
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!showBackPopup) {
        setShowBackPopup(true);
      }
      return true;
    });

    return () => {
      beforeRemoveRef.current();
      backHandler.remove();
      stopPositionWatch();
    };
  });

  return (
    <View style={MechanicalTaskDetailScreenStyles.container}>
      {/* 顶部导航 */}
      <CustomFarmingHeader
        navTitle={route.params?.navTitle ?? "机耕任务详情"}
        deviceStatus={deviceStatus ? deviceStatus : "0"}
        showRightIcon={farmingDetailData?.status !== "1"}
        handleConnectDeviceFun={handleConnectDevice}
      />

      {/* 地图容器 */}
      <View style={MechanicalTaskDetailScreenStyles.mapBox}>
        {/* 作业提示弹窗 */}
        {showPopupTips && farmingDetailData?.status !== "1" && (
          <View style={[MechanicalTaskDetailScreenStyles.popupTips, popupTipsStyle]}>
            <Text style={[MechanicalTaskDetailScreenStyles.popupTipsText, popupTipsStyle]}>{popupTips}</Text>
            <TouchableOpacity style={MechanicalTaskDetailScreenStyles.iconClose} onPress={closePopupTips}>
              <Image
                source={require("@/assets/images/farming/icon-close-transparent.png")}
                style={MechanicalTaskDetailScreenStyles.iconClose}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* 地图WebView */}
        <View style={MechanicalTaskDetailScreenStyles.map} collapsable={false}>
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
          {/* 地图版权信息 */}
          <View style={MechanicalTaskDetailScreenStyles.mapCopyright}>
            <Image source={require("@/assets/images/home/icon-td.png")} style={MechanicalTaskDetailScreenStyles.iconImg} />
            <Text style={MechanicalTaskDetailScreenStyles.copyrightText}>
              ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
            </Text>
          </View>
        </View>

        {/* 右侧图层控制按钮 */}
        <View style={MechanicalTaskDetailScreenStyles.rightControl}>
          <MapControlButton iconUrl={require("@/assets/images/home/icon-layer.png")} iconName="图层" onPress={onToggleMapLayer} />
        </View>

        {/* 定位按钮 */}
        <View style={MechanicalTaskDetailScreenStyles.locationControl}>
          <MapControlButton
            iconUrl={require("@/assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={onLocatePosition}
            style={{marginTop: 16}}
          />
        </View>

        {/* 左侧农事类型标识 */}
        <View style={MechanicalTaskDetailScreenStyles.farmingType}>
          <View style={MechanicalTaskDetailScreenStyles.farmingTypeItem}>
            <View style={[MechanicalTaskDetailScreenStyles.farmingTypeItemIcon, {borderColor: "#08AE3C"}]} />
            <Text style={MechanicalTaskDetailScreenStyles.farmingTypeText}>{farmingLocusStatus?.locusLogType}</Text>
          </View>
          {farmingLocusStatus?.manageLocusLogType && (
            <View style={MechanicalTaskDetailScreenStyles.farmingTypeItem}>
              <View
                style={[MechanicalTaskDetailScreenStyles.farmingTypeItemIcon, {borderColor: "#F58700", borderStyle: "dashed"}]}
              />
              <Text style={MechanicalTaskDetailScreenStyles.farmingTypeText}>{farmingLocusStatus?.manageLocusLogType}</Text>
            </View>
          )}
        </View>

        {/* 图层切换弹窗 */}
        {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}

        {/* 定位权限弹窗 */}
        <PermissionPopup
          visible={showPermissionPopup}
          onAccept={handleAcceptPermission}
          onReject={handleRejectPermission}
          title={"开启位置权限"}
          message={"获取位置权限将用于获取当前定位与记录轨迹"}
        />

        {/* 返回确认弹窗 */}
        <Popup
          visible={showBackPopup}
          title="是否退出任务"
          msgText="退出后将停止记录当前作业轨迹"
          leftBtnText="退出"
          rightBtnText="继续任务"
          msgTextStyle={{fontSize: 16}}
          onLeftBtn={() => {
            setShowBackPopup(false);
            beforeRemoveRef.current();
            navigation.goBack();
          }}
          onRightBtn={() => {
            setShowBackPopup(false);
          }}
        />

        {/* 作业状态弹窗 */}
        {farmingDetailData && <MechanicalTaskBottomPopup farmingDetailInfo={farmingDetailData} />}

        {/* 设备状态弹窗 */}
        <MechanicalDeviceStatusPopup
          visible={showMechanicalDeviceStatusPopup}
          title={"提示"}
          message={devicePopupMessage}
          acceptButtonText={devicePopupAcceptButtonText}
          rejectButtonText={devicePopupRejectButtonText}
          onAccept={handleAcceptMechanicalDeviceStatus}
          onReject={handleRejectMechanicalDeviceStatus}
        />
      </View>
    </View>
  );
});

export default MechanicalTaskDetailScreen;
