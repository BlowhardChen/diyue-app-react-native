// 点回找
import PermissionPopup from "@/components/common/PermissionPopup";
import {mapStore} from "@/stores/mapStore";
import {requestLocationPermission} from "@/utils/checkPermissions";
import {useEffect, useRef, useState} from "react";
import {View, Image, Text, TouchableOpacity, PermissionsAndroid} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import {showCustomToast} from "@/components/common/CustomToast";
import WebView from "react-native-webview";
import {MapWebviewMessage} from "@/types/land";
import {observer} from "mobx-react-lite";
import KeepAwake from "react-native-keep-awake";
import {useNavigation} from "@react-navigation/native";
import {deviceStore} from "@/stores/deviceStore";
import {FindPointScreenStyles} from "./styles/FindPointScreen";

const FindPointScreen = observer(({route}: {route: {params: {point: {lat: number; lon: number}}}}) => {
  const watchIdRef = useRef<number | null>(null);
  const webViewRef = useRef<WebView>(null);
  const isFirstLocationRef = useRef(true);
  const navigation = useNavigation();
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({lon: 0, lat: 0});
  const [isNavigationPolylineComplete, setIsNavigationPolylineComplete] = useState(false);

  // 启用屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  useEffect(() => {
    // 检查权限状态，如果已授予且 WebView 准备好，则启动定位
    const checkPermissionAndStart = async () => {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (granted && isWebViewReady) {
        startPositionWatch();
      }
    };

    checkPermissionAndStart();
  }, [isWebViewReady]);

  // 当WebView准备好时，应用保存的地图类型
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
    }
  }, [isWebViewReady, mapStore.mapType]);

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

  useEffect(() => {
    // 当组件卸载时，清除定位监听
    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

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
    stopPositionWatch();

    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        setCurrentLocation({lon: longitude, lat: latitude});
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
        isFirstLocationRef.current = false;
      },
      () => {},
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
    );

    const watchId = Geolocation.watchPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        console.log("位置更新:", longitude, latitude);
        setCurrentLocation({lon: longitude, lat: latitude});
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "UPDATE_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
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
      setShowPermissionPopup(false);
      if (isWebViewReady) {
        startPositionWatch();
      }
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
    navigation.navigate("AddDevice" as never);
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
        break;
      case "WEBVIEW_LOCATE_SELF":
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "DRAW_FIND_NAVIGATION_POLYLINE",
            data: {
              locationPoint: currentLocation,
              findPoint: {lon: Number(route.params.point.lon), lat: Number(route.params.point.lat)},
            },
          }),
        );
        break;
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
      {/* 权限弹窗 */}
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启位置权限"}
        message={"获取位置权限将用于获取当前定位与记录轨迹"}
      />
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
            <Image source={require("../../assets/images/home/icon-td.png")} style={FindPointScreenStyles.iconImg} />
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
          <View style={FindPointScreenStyles.deviceContentContainer}>
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
    </View>
  );
});

export default FindPointScreen;
