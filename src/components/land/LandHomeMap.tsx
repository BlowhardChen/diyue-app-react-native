import {View, Text, Image} from "react-native";
import WebView from "react-native-webview";
import {StyleSheet} from "react-native";

const LandHomeMap = () => {
  const handleMessage = (event: any) => {
    console.log("🌐 WebView Message:", event.nativeEvent.data);
  };

  return (
    <View style={styles.map}>
      <WebView
        source={{uri: "file:///android_asset/web/homeMap.html"}}
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
};

const styles = StyleSheet.create({
  map: {flex: 1},
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
});

export default LandHomeMap;
