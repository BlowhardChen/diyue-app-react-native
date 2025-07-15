import {View, Text, Image, Platform, PermissionsAndroid} from "react-native";
import WebView from "react-native-webview";
import {StyleSheet} from "react-native";
import {forwardRef, useImperativeHandle, useRef} from "react";

export type LandEnclosureMapRef = {
  triggerLocate: () => void;
};

const LandEnclosureMap = forwardRef<LandEnclosureMapRef>((_, ref) => {
  const webviewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    triggerLocate: async () => {
      let granted = false;

      if (Platform.OS === "android") {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        granted = true; // iOS 简化处理
      }

      if (granted) {
        const message = JSON.stringify({type: "LOCATE"});
        webviewRef.current?.postMessage(message);
      } else {
        console.warn("用户拒绝了定位权限");
      }
    },
  }));

  const handleMessage = (event: any) => {
    console.log("🌐 WebView Message:", event.nativeEvent.data);
  };

  return (
    <View style={styles.map}>
      <WebView
        ref={webviewRef}
        source={{uri: "file:///android_asset/web/enclosureMap.html"}}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        onMessage={handleMessage}
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
