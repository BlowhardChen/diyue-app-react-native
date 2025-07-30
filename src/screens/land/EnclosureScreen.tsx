import {View, Text, TouchableOpacity, Image, Platform, PermissionsAndroid} from "react-native";
import {styles} from "./styles/EnclosureScreen";
import {useCallback, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";
import MapSwitcher from "@/components/common/MapSwitcher";
import PermissionPopup from "@/components/common/PermissionPopup";
import WebView from "react-native-webview";
import Geolocation from "@react-native-community/geolocation";
import LandEnclosureCustomNavBar from "@/components/land/LandEnclosureCustomNavBar";

const EnclosureScreen = observer(() => {
  const [popupTips, setPopupTips] = useState("请点击打点按钮打点或点击十字光标标点");
  const [isShowSaveButton, setShowSaveButton] = useState(true);
  const [dotTotal, setDotTotal] = useState(0);
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  // 切换地图图层
  const onToggleMapLayer = () => {
    setShowMapSwitcher(true);
  };

  // 处理地图选择
  const handleSelectMap = ({type, layerUrl}: {type: string; layerUrl: string}) => {
    console.log("选中的地图类型:", type);
    console.log("地图地址:", layerUrl);
    switch (type) {
      case "标准地图":
        switchMapLayer("TIANDITU_ELEC");
        break;
      case "卫星地图":
        switchMapLayer("TIANDITU_SAT");
        break;
      case "自定义":
        switchMapLayer("CUSTOM", layerUrl);
        break;
      default:
        break;
    }
  };

  // 切换地图图层
  const switchMapLayer = (layerType: string, layerUrl?: string) => {
    console.log("切换地图图层", layerType, layerUrl);
    if (layerType === "CUSTOM") {
      webViewRef.current?.postMessage(JSON.stringify({type: "SWITCH_LAYER", layerType, layerUrl}));
    } else {
      webViewRef.current?.postMessage(JSON.stringify({type: "SWITCH_LAYER", layerType}));
    }
  };

  // 获取定位服务
  const getLocationService = async () => {
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
      console.error("❌ IP定位请求失败:", error);
    }
  };

  // 检查定位权限
  const checkLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }
    return true;
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

  // 同意定位权限
  const handleAcceptPermission = async () => {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      locateDevicePosition(true);
    } else {
      getLocationByIP();
    }
    setShowPermissionPopup(false);
  };

  // 拒绝定位权限
  const handleRejectPermission = () => {
    getLocationByIP();
    setShowPermissionPopup(false);
  };

  // 定位设备位置
  const locateDevicePosition = async (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
    if (isShowIcon) {
      await Geolocation.getCurrentPosition(position => {
        console.log("定位设备位置", position);
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

  // 接收WebView消息
  const receiveWebviewMessage = (event: any) => {
    console.log("📬 WebView Message:", event.nativeEvent.data);
    const data = event.nativeEvent.data;
    if (data === "地图加载完成") {
      setIsWebViewReady(true);
    }
  };

  useEffect(() => {
    getLocationService();
  });

  return (
    <View style={styles.container}>
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启位置权限"}
        message={"获取位置权限将用于获取当前定位与记录轨迹"}
      />
      <LandEnclosureCustomNavBar />
      <View style={styles.mapBox}>
        <View style={styles.popupTips}>
          <Text style={styles.popupTipsText}>{popupTips}</Text>
        </View>
        <View style={styles.map}>
          <WebView
            ref={webViewRef}
            source={{uri: "file:///android_asset/web/enclosureMap.html"}}
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
        <View style={styles.footerButtonGroup}>
          <TouchableOpacity style={[styles.buttonBase, styles.buttonRevoke]}>
            <Text style={styles.revokeText}>撤销</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonBase, styles.buttonDot]}>
            <Image source={require("@/assets/images/common/icon-plus.png")} style={styles.dotIcon} />
            <Text style={styles.dotText}>打点</Text>
          </TouchableOpacity>
          {isShowSaveButton ? (
            <TouchableOpacity style={[styles.buttonBase, styles.buttonSave]}>
              <Text style={[styles.saveText, {color: dotTotal >= 3 ? "#08ae3c" : "#999"}]}>保存</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.buttonBase, styles.placeholder]} />
          )}
        </View>
        <TouchableOpacity style={styles.locationCursor} activeOpacity={1}>
          {mapStore.mapType === "标准地图" ? (
            <Image source={require("@/assets/images/common/icon-cursor-green.png")} style={styles.cursorIcon} />
          ) : (
            <Image source={require("@/assets/images/common/icon-cursor.png")} style={styles.cursorIcon} />
          )}
        </TouchableOpacity>
        {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}
      </View>
    </View>
  );
});

export default EnclosureScreen;
