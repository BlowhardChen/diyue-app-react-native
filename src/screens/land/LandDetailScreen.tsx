// 地块详情
import PermissionPopup from "@/components/common/PermissionPopup";
import {mapStore} from "@/stores/mapStore";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {useIsFocused, useNavigation} from "@react-navigation/native";
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

  // 启用屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  useEffect(() => {
    getLandDetailInfoData(route.params.landId);
  }, []);

  // 当页面聚焦且弹窗显示时，重新请求接口
  useEffect(() => {
    if (isFocused && showLandDetailsPopup) {
      getLandDetailInfoData(route.params.landId);
    }
  }, [isFocused]);

  // 当WebView准备好时，应用保存的地图类型
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
    }
  }, [isWebViewReady, mapStore.mapType]);

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
    if (hasPermission) {
      locateDevicePosition(true);
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

  // 点回找
  const onFindPoint = () => {};

  // 地块管理
  const onLandManage = (landInfo: any) => {
    setLandInfo(landInfo);
    setIsShowLandManagePopup(true);
  };

  // 关闭地块管理弹窗
  const closeLandManagePopup = (action?: string) => {
    setIsShowLandManagePopup(false);
  };

  // 编辑地块名称(合并地块)
  const onEditLandName = () => {};

  // 获取地块详情数据
  const getLandDetailInfoData = async (id: string): Promise<void> => {
    const {data} = await getLandDetailsInfo(id);
    console.log("获取地块详情数据", data);
    setLandInfo(data[0]);
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
        {/* 右侧控制按钮 */}
        <View style={styles.rightControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-layer.png")}
            iconName="图层"
            onPress={onToggleMapLayer}
          />
        </View>
        <View style={styles.locationControl}>
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
            onFindPoint={onFindPoint}
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
    top: 240,
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
