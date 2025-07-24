import {View, Text, Image, StyleSheet} from "react-native";
import WebView from "react-native-webview";
import Geolocation from "@react-native-community/geolocation";
import {forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import {accelerometer, setUpdateIntervalForType, SensorTypes} from "react-native-sensors";

export type LandEnclosureMapRef = {
  locateDevicePosition: (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => void;
  startDeviceOrientation: () => void;
  stopDeviceOrientation: () => void;
  switchMapLayer: (layer: string, layerUrl?: string) => void;
};

const LandEnclosureMap = forwardRef<LandEnclosureMapRef>((_, ref) => {
  const webViewRef = useRef<WebView>(null);
  const orientationSubscription = useRef<any>(null);
  const lastHeading = useRef<number>(0);

  // 计算加速度传感器数据的方向
  const calculateHeading = (x: number, y: number) => Math.atan2(-x, y) * (180 / Math.PI) + 180;

  // 更新标记旋转角度
  const updateMarkerRotation = (heading: number) => {
    if (Math.abs(heading - lastHeading.current) < 5) return;
    lastHeading.current = heading;
    webViewRef.current?.postMessage(JSON.stringify({type: "UPDATE_MARKER_ROTATION", rotation: heading}));
  };

  // 启动设备方向传感器
  const startDeviceOrientation = () => {
    if (orientationSubscription.current) return;
    setUpdateIntervalForType(SensorTypes.accelerometer, 200);
    orientationSubscription.current = accelerometer.subscribe(({x, y}) => {
      const heading = calculateHeading(x, y);
      updateMarkerRotation(heading);
    });
  };

  // 停止设备方向传感器
  const stopDeviceOrientation = () => {
    if (orientationSubscription.current) {
      orientationSubscription.current.unsubscribe();
      orientationSubscription.current = null;
    }
  };

  // 定位设备位置
  const locateDevicePosition = (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
    if (isShowIcon) {
      Geolocation.getCurrentPosition(position => {
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

  // 切换地图图层
  const switchMapLayer = (layerType: string, layerUrl?: string) => {
    webViewRef.current?.postMessage(JSON.stringify({type: "SWITCH_LAYER", layerType, layerUrl}));
  };

  useImperativeHandle(ref, () => ({
    locateDevicePosition,
    startDeviceOrientation,
    stopDeviceOrientation,
    switchMapLayer,
  }));

  // 组件卸载时停止设备方向传感器
  useEffect(() => () => stopDeviceOrientation(), []);

  // 接收WebView消息
  const receiveWebviewMessage = (event: any) => {
    console.log("📬 WebView Message:", event.nativeEvent.data);
  };

  return (
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
  );
});

const styles = StyleSheet.create({
  map: {flex: 1},
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
});

export default LandEnclosureMap;
