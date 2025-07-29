import LandEnclosureCustomNavBar from "@/components/land/LandEnclosureCustomNavBar";
import LandEnclosureMap, {LandEnclosureMapRef} from "@/components/land/LandEnclosureMap";
import {View, Text, TouchableOpacity, Image, Platform, PermissionsAndroid} from "react-native";
import {styles} from "./styles/EnclosureScreen";
import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";
import MapSwitcher from "@/components/common/MapSwitcher";
import PermissionPopup from "@/components/common/PermissionPopup";

const EnclosureScreen = observer(() => {
  const [popupTips, setPopupTips] = useState("请点击打点按钮打点或点击十字光标标点");
  const [isShowSaveButton, setShowSaveButton] = useState(true);
  const [dotTotal, setDotTotal] = useState(0);
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  const mapRef = useRef<LandEnclosureMapRef>(null);

  const onToggleMapLayer = () => {
    setShowMapSwitcher(true);
  };

  // 处理地图选择
  const handleSelectMap = ({type, layerUrl}: {type: string; layerUrl: string}) => {
    console.log("选中的地图类型:", type);
    console.log("地图地址:", layerUrl);
    switch (type) {
      case "标准地图":
        mapRef.current?.switchMapLayer("TIANDITU_ELEC");
        break;
      case "卫星地图":
        mapRef.current?.switchMapLayer("TIANDITU_SAT");
        break;
      case "自定义":
        mapRef.current?.switchMapLayer("CUSTOM", layerUrl);
        break;
      default:
        break;
    }
  };

  // 获取定位服务
  const getLocationService = async () => {
    console.log("获取定位服务");
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      mapRef.current?.locateDevicePosition(true);
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
        mapRef.current?.locateDevicePosition(false, {lon, lat});
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
      mapRef.current?.locateDevicePosition(true);
    } else {
      setShowPermissionPopup(true);
    }
  };

  // 同意定位权限
  const handleAcceptPermission = async () => {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      mapRef.current?.locateDevicePosition(true);
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
      <View style={styles.map}>
        <View style={styles.popupTips}>
          <Text style={styles.popupTipsText}>{popupTips}</Text>
        </View>
        <LandEnclosureMap ref={mapRef} />
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
