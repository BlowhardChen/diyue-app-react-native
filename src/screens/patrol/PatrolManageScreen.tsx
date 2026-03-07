// 巡田管理
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
import {EnclosureScreenStyles} from "../land/styles/EnclosureScreen";
import {patrolTaskEnd, patrolTaskStart} from "@/services/farming";
import {PatrolManageScreenStyles} from "./styles/PatrolManageScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import {PatrolParamList} from "@/types/navigation";
import Popup from "@/components/common/Popup";
import {BackHandler} from "react-native";
import {saveTargetRoute} from "@/utils/navigationUtils";
import CustomFarmingHeader from "@/components/common/CustomFarmingHeader";
import {updateStore} from "@/stores/updateStore";

type PatrolManageParams = {
  id: string;
};

type PatrolManageRouteProp = RouteProp<Record<string, PatrolManageParams>, string>;

const PatrolManageScreen = observer(() => {
  const navigation = useNavigation<StackNavigationProp<PatrolParamList>>();
  const route = useRoute<PatrolManageRouteProp>();
  const {id} = route.params;
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
  const beforeRemoveRef = useRef<any>(null);
  const [isPatrol, setIsPatrol] = useState(false);
  const isPatrolRef = useRef(false);
  const [showEndPatrolPopup, setShowEndPatrolPopup] = useState(false);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<string>("0");

  console.log("PatrolManageScreen", id);

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

  // 获取已圈地地块数据
  useEffect(() => {
    updateStore.setIsUpdatePatrol(false);
    getEnclosureLandData();
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
        }
        isFirstLocationRef.current = false;
      },
      () => {},
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
    );

    const watchId = Geolocation.watchPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        if (!useLocationFromSocket) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "UPDATE_ICON_LOCATION",
              location: {lon: longitude, lat: latitude},
            }),
          );
          // 巡田状态下，GPS坐标实时追加轨迹线
          if (isPatrolRef.current) {
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: "UPDATE_PATROL_LOCUS",
                location: {lng: longitude, lat: latitude},
              }),
            );
          }
        }
        // 巡田状态+有WS+GPS坐标，向服务端上报GPS坐标
        if (isPatrolRef.current && webSocketRef.current && longitude && latitude) {
          webSocketRef.current.socketTask?.send({
            data: JSON.stringify([
              {
                deviceType: "taskLog",
                taskLogId: `${id}`,
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

  // 巡田拦截
  const onBackView = () => {
    if (isPatrol) {
      setShowBackPopup(true);
    } else {
      navigation.goBack();
    }
  };

  // 连接设备
  const connectDevice = () => {
    saveTargetRoute(route.name);
    navigation.navigate("AddDevice" as any);
  };

  //  异常上报
  const uploadAbnormal = async () => {
    navigation.navigate("AbnormalUpload", {id});
  };

  // 开始巡田
  const startPatrol = async () => {
    await patrolTaskStart({id});
    setIsPatrol(true);
    isPatrolRef.current = true;
  };

  // 结束巡田
  const endPatrol = () => {
    setShowEndPatrolPopup(true);
  };

  // 确认结束巡田
  const confirmEndPatrol = async () => {
    await patrolTaskEnd({id});
    setShowEndPatrolPopup(false);
    setIsPatrol(false);
    isPatrolRef.current = false;
    updateStore.setIsUpdatePatrol(true);
    showCustomToast("success", "已为你保存巡田记录");
    setTimeout(() => {
      navigation.goBack();
    }, 1200);
  };

  // 退出巡田
  const quitPatrol = () => {
    setShowBackPopup(false);
    setIsPatrol(false);
    isPatrolRef.current = false;
    navigation.goBack();
  };

  // 继续巡田
  const continuePatrol = () => {
    setShowBackPopup(false);
  };

  // 获取已圈地地块数据
  const getEnclosureLandData = async () => {
    const {data} = await getLandListData({quitStatus: "0"});
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
        if (socketData.taskType === "3" && socketData.lng && socketData.lat && socketData.lng !== 0 && socketData.lat !== 0) {
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

          if (isPatrolRef.current) {
            console.log("巡田状态+有WS+GPS坐标，向服务端上报GPS坐标");
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: "UPDATE_PATROL_LOCUS",
                location: {lng: newLocation.lon, lat: newLocation.lat},
              }),
            );
          }

          if (isPatrolRef.current && webSocketRef.current && newLocation) {
            webSocketRef.current.socketTask?.send({
              data: JSON.stringify([
                {
                  deviceType: "taskLog",
                  taskLogId: `${id}`,
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
        if (socketData.deviceStatus === "2") {
          setDeviceStatus("2");
          deviceStore.listenDeviceStatus("2");
          setUseLocationFromSocket(false);
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

  // 返回键监听
  useFocusEffect(() => {
    beforeRemoveRef.current = navigation.addListener("beforeRemove", e => {
      if (isPatrol) {
        // 仅巡田状态拦截返回
        e.preventDefault();
        if (!showBackPopup) {
          setShowBackPopup(true);
        }
      }
    });
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isPatrol) {
        if (!showBackPopup) {
          setShowBackPopup(true);
        }
        return true;
      } else {
        return false;
      }
    });
    return () => {
      beforeRemoveRef.current();
      backHandler.remove();
      stopPositionWatch();
    };
  });

  return (
    <View style={EnclosureScreenStyles.container}>
      {/* 顶部导航 */}
      <CustomFarmingHeader
        navTitle={"巡田管理"}
        showRightIcon={true}
        deviceStatus={deviceStatus ? deviceStatus : "0"}
        onBackView={onBackView}
        handleConnectDeviceFun={connectDevice}
      />
      {/* 地图 */}
      <View style={EnclosureScreenStyles.mapBox}>
        <View style={EnclosureScreenStyles.map} collapsable={false}>
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
          <View style={EnclosureScreenStyles.mapCopyright}>
            <Image source={require("@/assets/images/home/icon-td.png")} style={EnclosureScreenStyles.iconImg} />
            <Text style={EnclosureScreenStyles.copyrightText}>
              ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
            </Text>
          </View>
        </View>
        {/* 右侧控制按钮 */}
        <View style={EnclosureScreenStyles.rightControl}>
          <MapControlButton iconUrl={require("@/assets/images/home/icon-layer.png")} iconName="图层" onPress={onToggleMapLayer} />
        </View>
        <View style={EnclosureScreenStyles.locationControl}>
          <MapControlButton
            iconUrl={require("@/assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={onLocatePosition}
            style={{marginTop: 16}}
          />
        </View>
        {/* 底部按钮 */}
        <View style={PatrolManageScreenStyles.patrolButton}>
          <View style={PatrolManageScreenStyles.patrolButtonBox}>
            <TouchableOpacity style={PatrolManageScreenStyles.tips} onPress={uploadAbnormal} activeOpacity={0.9}>
              <Image
                source={require("@/assets/images/farming/icon-warning.png")}
                style={PatrolManageScreenStyles.warningImg}
                resizeMode="cover"
              />
              <Text style={PatrolManageScreenStyles.tipsText}>异常上报</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[PatrolManageScreenStyles.button, {backgroundColor: isPatrol ? "#ff3d3b" : "#08ae3c"}]}
              onPress={isPatrol ? endPatrol : startPatrol}>
              <Text style={PatrolManageScreenStyles.buttonText}>{isPatrol ? "结束巡田" : "开始巡田"}</Text>
            </TouchableOpacity>
          </View>
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

        {/* 退出巡田确认弹窗  */}
        <Popup
          visible={showBackPopup}
          title="是否退出巡田"
          msgText="退出后将停止记录轨迹"
          leftBtnText="退出"
          rightBtnText="继续巡田"
          onLeftBtn={quitPatrol}
          onRightBtn={continuePatrol}
        />

        {/* 结束巡田确认弹窗  */}
        <Popup
          visible={showEndPatrolPopup}
          title="提示"
          msgText="确定要结束巡田？"
          leftBtnText="取消"
          rightBtnText="确定"
          rightBtnStyle={{color: "#ff3d3b"}}
          onLeftBtn={() => setShowEndPatrolPopup(false)}
          onRightBtn={confirmEndPatrol}
        />
      </View>
    </View>
  );
});

export default PatrolManageScreen;
