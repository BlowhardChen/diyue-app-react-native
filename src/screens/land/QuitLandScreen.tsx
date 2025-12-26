// 退地地块
import PermissionPopup from "@/components/common/PermissionPopup";
import {mapStore} from "@/stores/mapStore";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {useCallback, useEffect, useRef, useState} from "react";
import {View, Image, Text, StyleSheet, TouchableOpacity, Platform} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import {showCustomToast} from "@/components/common/CustomToast";
import WebView from "react-native-webview";
import {LandDetailInfo, MapWebviewMessage} from "@/types/land";
import MapSwitcher from "@/components/common/MapSwitcher";
import MapControlButton from "@/components/land/MapControlButton";
import {observer} from "mobx-react-lite";
import KeepAwake from "react-native-keep-awake";
import {getLandDetailsInfo, getLandListData} from "@/services/land";
import LinearGradient from "react-native-linear-gradient";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import QuitLandDetailPopup from "./components/QuitLandDetailPopup";
import {updateStore} from "@/stores/updateStore";

const QuitLandScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const watchIdRef = useRef<number | null>(null);
  const webViewRef = useRef<WebView>(null);
  const isFirstLocationRef = useRef(true);
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [showLandDetailsPopup, setShowLandDetailsPopup] = useState(false);
  const [landDetailInfo, setLandDetailInfo] = useState();
  const [landInfoList, setLandInfoList] = useState<LandDetailInfo[]>([]);

  // 启用屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  // 初始化时检查定位权限（不直接执行定位，等待WebView就绪）
  useEffect(() => {
    checkLocationPermission().then(hasPermission => {
      if (!hasPermission) {
        setShowPermissionPopup(true);
      }
    });
  }, []);

  // 当WebView准备好时，应用保存的地图类型并尝试定位
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
      // WebView就绪后检查权限并尝试定位
      checkLocationPermission().then(hasPermission => {
        if (hasPermission) {
          onLocatePosition();
        }
      });
    }
  }, [isWebViewReady, mapStore.mapType]);

  // 获取退地地块数据
  useEffect(() => {
    getQuitLandData();
  }, []);

  // 初始化地块更新状态
  useEffect(() => {
    updateStore.setIsUpdateLand(false);
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

  // 显示地图切换器
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

  // 定位位置（确保WebView就绪后执行）
  const onLocatePosition = async () => {
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      // 确保WebView就绪后再执行定位
      if (isWebViewReady) {
        locateDevicePosition(true);
        startPositionWatch(); // 启动持续定位
      } else {
        // 等待WebView就绪后重试
        const waitForWebView = setInterval(() => {
          if (isWebViewReady) {
            locateDevicePosition(true);
            startPositionWatch();
            clearInterval(waitForWebView);
          }
        }, 500);
        // 防止内存泄漏，设置超时清理
        setTimeout(() => clearInterval(waitForWebView), 10000);
      }
    } else {
      setShowPermissionPopup(true);
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

  // 定位设备位置（增加错误处理）
  const locateDevicePosition = async (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
    if (isShowIcon) {
      await Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SET_ICON_LOCATION",
              location: {lon: longitude, lat: latitude},
            }),
          );
        },
        error => {
          console.error("单次定位失败:", error);
          showCustomToast("error", "获取位置失败，请重试");
        },
      );
    } else if (coordinate) {
      webViewRef.current?.postMessage(JSON.stringify({type: "SET_LOCATION", location: coordinate}));
    }
  };

  // 开启持续定位
  const startPositionWatch = async () => {
    stopPositionWatch();

    // 先获取一次当前位置
    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
        isFirstLocationRef.current = false;
      },
      error => {
        console.error("初始定位失败:", error);
        showCustomToast("error", "初始定位失败");
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
    );

    // 启动位置监听
    const watchId = Geolocation.watchPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        console.log("位置更新:", longitude, latitude);
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
        onLocatePosition(); // 权限通过后执行定位
      }
    }
  };

  // 拒绝定位权限
  const handleRejectPermission = () => {
    getLocationByIP();
    setShowPermissionPopup(false);
  };

  // 关闭地块详情弹窗
  const closeLandDetailsPopup = (action?: string, id?: string) => {
    switch (action) {
      case "delete":
        showCustomToast("success", "地块删除成功");
        break;
      case "restore":
        showCustomToast("success", "地块恢复成功");
        break;
      default:
        break;
    }
    const landManageInfo = landInfoList.find(item => item.id === id);
    setShowLandDetailsPopup(false);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "RESET_LAND_ACTIVE_STYLE",
      }),
    );
    if (action) {
      updateStore.setIsUpdateLand(true);
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "REMOVE_SPECIFY_LAND",
          data: landManageInfo,
        }),
      );
    }
  };

  // 获取已退地地块数据
  const getQuitLandData = async (): Promise<void> => {
    try {
      const {data} = await getLandListData({quitStatus: "1", type: "2"});
      console.log("获取已退地地块数据", data);
      setLandInfoList(data as unknown as LandDetailInfo[]);
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "DRAW_ENCLOSURE_LAND",
          data: data,
        }),
      );
    } catch (error) {
      console.error("获取退地数据失败:", error);
      showCustomToast("error", "获取地块数据失败");
    }
  };

  // 获取地块详情数据
  const getLandDetailInfoData = async (id: string): Promise<void> => {
    try {
      const {data} = await getLandDetailsInfo(id);
      console.log("获取地块详情数据", data);
      setLandDetailInfo(data[0]);
      setShowLandDetailsPopup(true);
    } catch (error) {
      showCustomToast("error", "获取地块详情失败");
    }
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
        break;
      case "POLYGON_CLICK":
        await getLandDetailInfoData(data.id as string);
        break;
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

          <Text style={styles.title}>退地地块</Text>

          <View style={styles.iconWrapper} />
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
        {/* 地块类型图标 */}
        <View style={styles.landType}>
          <View style={styles.landTypeItem}>
            <Image source={require("@/assets/images/home/icon-green.png")} style={styles.icon} />
            <Text style={styles.text}>流转</Text>
          </View>

          <View style={styles.landTypeItem}>
            <Image source={require("@/assets/images/home/icon-blue.png")} style={styles.icon} />
            <Text style={styles.text}>托管</Text>
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
        <View style={[styles.locationControl, {bottom: showLandDetailsPopup ? 500 : 60}]}>
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
          <QuitLandDetailPopup landInfo={landDetailInfo as unknown as LandDetailInfo} onClose={closeLandDetailsPopup} />
        )}
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
  landType: {
    position: "absolute",
    bottom: 60,
    left: 16,
    alignItems: "center",
    justifyContent: "space-around",
    width: 86,
    height: 76,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16 / 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  landTypeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  text: {
    fontSize: 18,
    color: "#fff",
  },
});

export default QuitLandScreen;
